<?php

use Illuminate\Http\Request;
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
            EnsureFrontendRequestsAreStateful::class,
            HandleCors::class
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
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            // Get the exception class name
            $className = get_class($e);

            // Get our custom handlers
            $handlers = App\Exceptions\ApiExceptionHandler::$handlers;

            // Check if we have a specific handler for this exception
            if (array_key_exists($className, $handlers)) {
                $method = $handlers[$className];
                $apiHandler = new App\Exceptions\ApiExceptionHandler();
                return $apiHandler->$method($e, $request);
            }

            // Gunakan helper errorException agar format seragam
            return errorException(
                type: basename(get_class($e)),
                status: $e->getCode() ?: 500,
                message: $e->getMessage() ?: 'An unexpected error occurred',
                extra: app()->environment('local', 'testing') ? [
                    'debug' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTraceAsString(),
                    ]
                ] : []
            );
        });
    })
    ->create();
