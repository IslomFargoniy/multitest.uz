<?php

namespace Tests\Feature\Security;

use App\Models\Otp;
use App\Models\User\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class EdgeHardeningTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_otp_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login-otp', ['otp' => '000000'])->assertStatus(400);
        }

        $this->postJson('/api/v1/auth/login-otp', ['otp' => '000000'])->assertStatus(429);
    }

    public function test_password_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'a@b.c', 'password' => 'x'])->assertStatus(401);
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'a@b.c', 'password' => 'x'])->assertStatus(429);
    }

    public function test_candidate_code_entry_is_rate_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/mock-student/enter', ['code' => 'MS000000'])->assertStatus(422);
        }

        $this->postJson('/mock-student/enter', ['code' => 'MS000000'])->assertStatus(429);
    }

    public function test_google_login_requires_matching_audience_and_verified_email(): void
    {
        $this->seedRoles();
        config(['services.google.allowed_client_ids' => ['good-client']]);

        $token = fn (array $o = []) => array_merge([
            'sub' => '123', 'email' => 'u@example.com', 'email_verified' => 'true',
            'iss' => 'https://accounts.google.com', 'aud' => 'good-client', 'name' => 'U',
        ], $o);

        Http::fake(['oauth2.googleapis.com/*' => Http::sequence()
            ->push($token(['aud' => 'evil-client']))
            ->push($token(['email_verified' => 'false']))
            ->push($token(['iss' => 'https://evil.example']))
            ->push($token())]);

        $this->postJson('/api/v1/auth/google', ['id_token' => 'x'])->assertStatus(400);
        $this->postJson('/api/v1/auth/google', ['id_token' => 'x'])->assertStatus(400);
        $this->postJson('/api/v1/auth/google', ['id_token' => 'x'])->assertStatus(400);
        $this->assertDatabaseCount('users', 0);

        $this->postJson('/api/v1/auth/google', ['id_token' => 'x'])->assertOk()->assertJsonPath('data.email', 'u@example.com');
        $this->assertDatabaseHas('users', ['email' => 'u@example.com', 'google_id' => '123']);
    }

    public function test_google_login_fails_closed_without_configured_client_ids(): void
    {
        config(['services.google.allowed_client_ids' => []]);

        $this->postJson('/api/v1/auth/google', ['id_token' => 'x'])->assertStatus(503);
    }

    public function test_telegram_webhook_requires_secret_header(): void
    {
        config(['services.telegram.webhook_secret' => 's3cret', 'services.telegram.bot_token' => '1:T']);

        $this->postJson('/bot/MultitestUzBot/webhook', ['update_id' => 1])->assertForbidden();
        $this->postJson('/bot/MultitestUzBot/webhook', ['update_id' => 1], ['X-Telegram-Bot-Api-Secret-Token' => 'wrong'])->assertForbidden();
        $this->postJson('/bot/MultitestUzBot/webhook', ['update_id' => 1], ['X-Telegram-Bot-Api-Secret-Token' => 's3cret'])->assertOk();
    }

    public function test_telegram_webhook_is_closed_when_secret_is_not_configured(): void
    {
        config(['services.telegram.webhook_secret' => null]);

        $this->postJson('/bot/MultitestUzBot/webhook', ['update_id' => 1], ['X-Telegram-Bot-Api-Secret-Token' => ''])->assertForbidden();
    }

    public function test_app_open_validates_and_escapes_otp(): void
    {
        $this->get('/app/open?otp=%3Cscript%3Ealert(1)%3C/script%3E')->assertNotFound();
        $this->get('/app/open?otp=12345')->assertNotFound();

        $this->get('/app/open?otp=123456')->assertOk()
            ->assertSee('multitest://auth?otp=123456', false);
    }
}
