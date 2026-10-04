<?php

return [
    /*
    | Initial admin created by UserSeeder. Read here (not via env() in the seeder) so the values
    | also work when the configuration is cached (`php artisan optimize`).
    */
    'admin' => [
        'email' => env('ADMIN_EMAIL', 'admin@gmail.com'),
        'phone' => env('ADMIN_PHONE', '998901234567'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    /*
    | Swagger UI (/api/documentation) is admin-only and hidden in production unless explicitly enabled.
    */
    'swagger_enabled' => (bool) env('L5_SWAGGER_ENABLED', false),
];
