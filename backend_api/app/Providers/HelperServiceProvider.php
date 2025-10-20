<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;

class HelperServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Path ke folder helpers
        $helpersPath = app_path('Helpers');

        // Pastikan folder ada
        if (File::isDirectory($helpersPath)) {
            $helperFiles = File::allFiles($helpersPath);

            foreach ($helperFiles as $file) {
                require_once $file->getPathname();
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
