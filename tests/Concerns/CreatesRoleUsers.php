<?php

namespace Tests\Concerns;

use App\Models\User\User;
use Database\Seeders\RoleSeeder;

trait CreatesRoleUsers
{
    protected function seedRoles(): void
    {
        $this->seed(RoleSeeder::class);
    }

    protected function userWithRole(string $role, array $attributes = []): User
    {
        $this->seedRoles();
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    protected function admin(array $attributes = []): User
    {
        return $this->userWithRole('Admin', $attributes);
    }

    protected function teacher(array $attributes = []): User
    {
        return $this->userWithRole('Teacher', $attributes);
    }

    protected function student(array $attributes = []): User
    {
        return $this->userWithRole('Student', $attributes);
    }
}
