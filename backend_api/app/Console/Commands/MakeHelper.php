<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeHelper extends Command
{
    protected $signature = 'make:helper {name : The name of the helper (without .php)}';
    protected $description = 'Create a new helper file inside app/Helpers directory';

    public function handle()
    {
        $name = $this->argument('name');
        $className = ucfirst($name);
        $fileName = $className . '.php';
        $helpersPath = app_path('Helpers');
        $filePath = "{$helpersPath}/{$fileName}";
        $namespace = "App\\Helpers\\{$className}";

        // Pastikan folder Helpers ada
        if (!File::isDirectory($helpersPath)) {
            File::makeDirectory($helpersPath, 0755, true);
        }

        // Cegah overwrite
        if (File::exists($filePath)) {
            $this->components->error("Helper already exists!");
            return self::FAILURE;
        }

        // Template isi helper (dengan namespace)
        $stub = <<<PHP
        <?php

        /**
         * {$className} Helper
         * 
         * Created via artisan make:helper
         */

        if (!function_exists('example_{$name}_function')) {
            function example_{$name}_function() {
                // Your helper logic here
            }
        }
        PHP;

        File::put($filePath, $stub);

        $this->newLine();
        $this->components->info("Helper [{$namespace}] created successfully.");

        return self::SUCCESS;
    }
}
