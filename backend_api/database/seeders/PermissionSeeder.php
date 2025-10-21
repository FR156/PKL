<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'login',
            'get user',
            'logout',
            'view accounts',
            'create accounts',
            'edit accounts',
            'delete accounts',
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign permissions to role',
            'view role permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum', // <-- penting
            ]);
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
