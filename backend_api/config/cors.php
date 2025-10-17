<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi CORS
    |--------------------------------------------------------------------------
    |
    | File ini mengatur aturan CORS yang digunakan oleh middleware HandleCors.
    | Ini adalah solusi standar untuk API yang menggunakan Sanctum/Cookies.
    |
    */

    // Jalur (paths) yang akan dicek CORS-nya.
    // 'api/*' mencakup semua endpoint API lu.
    // 'sanctum/csrf-cookie' penting untuk inisialisasi Sanctum.
    'paths' => ['api/*'],

    // Metode HTTP yang diizinkan (GET, POST, dll.)
    'allowed_methods' => ['*'],

    // Origin (Frontend) yang diizinkan untuk mengakses API lu.
    // KUNCI: Harus spesifik dan bukan wildcard (*).
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],

    'allowed_origins_patterns' => [],

    // Header yang diizinkan dari frontend (Content-Type, Authorization, dll.)
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // KUNCI UTAMA: Harus TRUE karena frontend lu mengirim withCredentials (cookies/Sanctum).
    // TRUE memaksa 'Access-Control-Allow-Origin' TIDAK boleh *
    'supports_credentials' => true,

    'max_age' => 0,

];
