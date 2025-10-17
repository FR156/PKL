<?php

use Illuminate\Support\Facades\Log;

if (!function_exists('getClassName')) {
    /**
     * Ambil nama pendek dari class atau object.
     * Contoh: App\Exceptions\NotFoundException → NotFoundException
     */
    function getClassName(object|string $class): string
    {
        return basename(str_replace('\\', '/', is_object($class) ? get_class($class) : $class));
    }
}

if (!function_exists('logError')) {
    /**
     * Helper global untuk logging dengan format konsisten.
     * Bisa digunakan untuk log biasa maupun exception.
     *
     * @param string $message   Pesan utama log
     * @param array $context    Data tambahan opsional
     * @param Throwable|null $e Exception opsional
     * @param string $level     Level log ('error', 'warning', 'info', dll)
     */
    function logError(
        string $message,
        array $context = [],
        ?Throwable $e = null,
        string $level = 'warning'
    ): void {
        // Base context (aman dipakai di CLI / HTTP)
        $baseContext = [
            'url'    => request()?->fullUrl() ?? null,
            'method' => request()?->method() ?? null,
            'ip'     => request()?->ip() ?? null,
        ];

        // Tambahkan info dari exception kalau ada
        if ($e) {
            $context = array_merge($context, [
                'exception'     => getClassName($e),
                'error_message' => $e->getMessage(),
                'file'          => $e->getFile(),
                'line'          => $e->getLine(),
                'trace_snippet' => collect(explode("\n", $e->getTraceAsString()))
                    ->take(3)
                    ->implode("\n"),
            ]);
        }

        // Merge context dan log
        Log::$level($message, array_filter(array_merge($baseContext, $context)));
    }
}
