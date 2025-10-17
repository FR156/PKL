<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken; // Menggunakan import yang BENAR

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->api(prepend: [
            // 1. Mengaktifkan CORS (Berdasarkan config/cors.php)
            HandleCors::class,
            EnsureFrontendRequestsAreStateful::class,
        ]);

        // --- KUNCI PERBAIKAN: MENONAKTIFKAN CSRF UNTUK API (MENGATASI ERROR 419) ---
        // Metode yang benar di Laravel 11 untuk mengecualikan API dari pemeriksaan CSRF.
        $middleware->validateCsrfTokens(except: [
            'api/*', // Semua route yang dimulai dengan /api/ tidak akan dicek CSRF
        ]);
        // ------------------------------------------------------------------------

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
