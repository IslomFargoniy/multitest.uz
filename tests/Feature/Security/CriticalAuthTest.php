<?php

namespace Tests\Feature\Security;

use App\Models\Otp;
use App\Models\User\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class CriticalAuthTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private string $token = '123456:TEST-TOKEN';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.telegram.bot_token' => $this->token]);
        $this->seedRoles();
    }

    private function initData(array $user, ?int $authDate = null, bool $tamper = false): string
    {
        $params = [
            'auth_date' => (string) ($authDate ?? time()),
            'query_id' => 'AAH',
            'user' => json_encode($user),
        ];
        ksort($params);
        $lines = [];
        foreach ($params as $k => $v) {
            $lines[] = "$k=$v";
        }
        $secret = hash_hmac('sha256', $this->token, 'WebAppData', true);
        $params['hash'] = hash_hmac('sha256', implode("\n", $lines), $secret);
        if ($tamper) {
            $params['user'] = json_encode(['id' => 1, 'first_name' => 'Evil']);
        }

        return http_build_query($params);
    }

    public function test_payment_panel_routes_are_gone(): void
    {
        foreach (app('router')->getRoutes() as $route) {
            $this->assertStringStartsNotWith('payment', $route->uri());
            $this->assertStringStartsNotWith('pay/', $route->uri());
            $this->assertStringStartsNotWith('handle/', $route->uri());
        }
    }

    public function test_hardcoded_otp_does_not_log_in(): void
    {
        User::factory()->create();

        $this->postJson('/api/v1/auth/login-otp', ['otp' => '159123'])->assertStatus(400);
    }

    public function test_valid_otp_logs_in(): void
    {
        $user = User::factory()->create();
        Otp::create(['user_id' => $user->id, 'code' => '654321', 'expired_at' => now()->addMinutes(5)]);

        $this->postJson('/api/v1/auth/login-otp', ['otp' => '654321'])
            ->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_webapp_login_accepts_valid_signature(): void
    {
        $this->postJson('/webapp-login', ['init_data' => $this->initData(['id' => 777, 'first_name' => 'Ali'])])
            ->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', ['telegram_id' => '777', 'name' => 'Ali']);
        $this->assertAuthenticated();
    }

    public function test_webapp_login_rejects_tampered_stale_and_missing_data(): void
    {
        $this->postJson('/webapp-login', ['init_data' => $this->initData(['id' => 1, 'first_name' => 'A'], null, true)])->assertStatus(403);
        $this->postJson('/webapp-login', ['init_data' => $this->initData(['id' => 2, 'first_name' => 'A'], time() - 999999)])->assertStatus(403);
        $this->postJson('/webapp-login', ['id' => 3, 'first_name' => 'Forged'])->assertStatus(422);

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }
}
