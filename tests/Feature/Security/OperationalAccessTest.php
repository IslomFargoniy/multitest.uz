<?php

namespace Tests\Feature\Security;

use App\Models\User\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class OperationalAccessTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_swagger_is_admin_only(): void
    {
        $this->get('/api/documentation')->assertForbidden();
        $this->actingAs($this->student())->get('/api/documentation')->assertForbidden();
    }

    public function test_swagger_is_hidden_in_production_unless_enabled(): void
    {
        $admin = $this->admin();
        $this->app['env'] = 'production';
        config(['multitest.swagger_enabled' => false]);

        $this->actingAs($admin)->get('/api/documentation')->assertNotFound();
    }

    public function test_telescope_gate_is_admin_only(): void
    {
        $this->assertTrue(Gate::forUser($this->admin())->allows('viewTelescope'));
        $this->assertFalse(Gate::forUser($this->teacher())->allows('viewTelescope'));
    }

    public function test_seeder_refuses_weak_password_outside_local(): void
    {
        $this->seedRoles();
        $this->app['env'] = 'production';
        config(['multitest.admin.password' => 'short', 'multitest.admin.email' => 'a@b.test']);

        (new UserSeeder)->run();

        $this->assertDatabaseMissing('users', ['email' => 'a@b.test']);
    }

    public function test_seeder_creates_admin_with_strong_password(): void
    {
        $this->seedRoles();
        $this->app['env'] = 'production';
        config(['multitest.admin.password' => 'a-long-enough-pass', 'multitest.admin.email' => 'boss@b.test']);

        (new UserSeeder)->run();

        $this->assertTrue(User::where('email', 'boss@b.test')->firstOrFail()->hasRole('Admin'));
    }
}
