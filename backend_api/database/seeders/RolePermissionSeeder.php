<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permission::all();

        $superadmin = Role::firstWhere('name','super-admin');
        if ($superadmin) {
            $superadmin->syncPermissions($allPermissions);
        }

        $owner = Role::firstWhere('name','owner');
        if ($owner) {
            $owner->syncPermissions($allPermissions);
        }

        $manager = Role::firstWhere('name','manager');
        if ($manager) {
            $manager->syncPermissions(
                $allPermissions->whereIn('name', [
                    'get user',
                    'logout',
                    'view accounts',
                    'edit accounts',
                    'view roles',
                    'view role permissions'
                ])->values()
            );
        }

        $supervisor = Role::firstWhere('name','supervisor');
        if ($supervisor) {
            $supervisor->syncPermissions(
                $allPermissions->whereIn('name', ['get user','logout','view accounts','view roles'])->values()
            );
        }

        $employee = Role::firstWhere('name','employee') ?? Role::firstWhere('name','karyawan');
        if ($employee) {
            $employee->syncPermissions(
                $allPermissions->whereIn('name', ['login','get user','logout'])->values()
            );
        }

        $this->command->info('Role permissions assigned successfully!');
    }
}
