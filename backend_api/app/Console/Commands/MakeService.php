<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeService extends Command
{
    protected $signature = 'make:service {name : The name of the service (supports nested folders, without .php)}';
    protected $description = 'Create a new service class inside app/Services directory';

    public function handle()
    {
        $name = $this->argument('name');

        // Ubah slash ke folder path dan ambil class name-nya
        $name = str_replace('\\', '/', $name);
        $className = ucfirst(class_basename($name));
        $relativePath = dirname($name) !== '.' ? dirname($name) : '';
        $servicesPath = app_path('Services' . ($relativePath ? '/' . $relativePath : ''));
        $filePath = "{$servicesPath}/{$className}.php";

        // Buat namespace dinamis berdasarkan folder
        $namespace = 'App\\Services' . ($relativePath ? '\\' . str_replace('/', '\\', $relativePath) : '');

        // Pastikan folder Services/<nested> ada
        if (!File::isDirectory($servicesPath)) {
            File::makeDirectory($servicesPath, 0755, true);
        }

        // Cegah overwrite
        if (File::exists($filePath)) {
            $this->components->error("Service already exists!");
            return self::FAILURE;
        }

        // Siapkan namespace line untuk stub
        $namespaceLine = "namespace {$namespace};";

        // Template isi service class (stub)
        $stub = <<<PHP
        <?php

        {$namespaceLine}

        /**
         * {$className} Service
         * 
         * Created via artisan make:service
         */
        class {$className}
        {
            public function __construct()
            {
                // Initialize your dependencies here
            }

            /**
             * Example method
             */
            public function example()
            {
                // Your logic here
            }
        }
        PHP;

        File::put($filePath, $stub);

        $this->newLine();
        $this->components->info("Service [{$namespace}\\{$className}] created successfully.");

        return self::SUCCESS;
    }
}