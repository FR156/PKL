<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // pastikan role super-admin ada
        $role = Role::firstOrCreate(['name' => 'super-admin']);

        // bikin user super admin
        $user = User::firstOrCreate(
            ['email' => 'admin@hrms.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'), // ubah sesuai kebutuhan
            ]
        );

        // assign role ke user
        if (!$user->hasRole('super-admin')) {
            $user->assignRole($role);
        }
    }
}
