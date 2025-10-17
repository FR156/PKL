<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Menentukan apa saja request lintas domain yang diizinkan.
    | Sesuaikan domain frontend untuk production.
    |
    */

    // Semua API endpoint
    'paths' => ['api/*'],

    // Semua HTTP method diizinkan
    'allowed_methods' => ['*'],

    // Hanya izinkan domain frontend (ganti sesuai environment)
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    // Semua header diizinkan
    'allowed_headers' => ['*'],

    // Header yang boleh diexpose ke frontend
    'exposed_headers' => [],

    // Cache preflight request (dalam detik)
    'max_age' => 0,

    // Tidak menggunakan cookie/session, cukup token bearer
    'supports_credentials' => false,
];
