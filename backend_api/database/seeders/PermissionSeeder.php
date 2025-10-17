<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            //Public
            'login',

            // Basic user actions
            'get user',
            'logout',

            // User management
            'view accounts',
            'create accounts',
            'edit accounts',
            'delete accounts',

            // Role management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',

            // Assign permissions to role
            'assign permissions to role',
            'view role permissions',

            // Attendance Management
            'view attendances',
            'create attendances',
            'edit attendances',
            'delete attendances',
            'review attendances',
            'view approved attendances',
            'create attendance reasons',
            'view attendance reasons',
            'review attendance reasons',
            'delete attendance reasons',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
