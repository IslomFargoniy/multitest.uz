<?php

namespace Database\Seeders;

use App\Models\User\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seeds the initial admin. Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD.
     * Outside local/testing environments a missing or short password aborts the seeding.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@gmail.com');
        $password = env('ADMIN_PASSWORD');

        if (app()->environment(['local', 'testing'])) {
            $password ??= 'password';
        }

        if (! $password || (! app()->environment(['local', 'testing']) && strlen($password) < 12)) {
            $this->command?->error('Set ADMIN_PASSWORD (min 12 characters) in .env before seeding the admin user.');

            return;
        }

        $admin = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'phone' => env('ADMIN_PHONE', '998901234567'),
                'password' => Hash::make($password),
            ]
        );
        $admin->assignRole('Admin');
    }
}
