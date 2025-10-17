<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Account;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil role super-admin yang sudah ada (dari RoleSeeder)
        $role = Role::where('name', 'super-admin')->first();

        // Buat user super-admin (kalau belum ada)
        $superAdmin = Account::firstOrCreate(
            ['email' => 'superadmin@absolute.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'), // Ganti dengan password yang lebih aman
            ]
        );

        // Assign role ke user
        if ($role) {
            $superAdmin->assignRole($role);
        }

        $this->command->info('Super Admin user created successfully!');
    }
}
