<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class DummySeeder extends Seeder
{
    public function run(): void
    {
        // Cek role di db
        $roles = ['owner', 'manager', 'supervisor', 'employee'];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        User::factory(1)->create()->each(function ($user) {
            $user->assignRole('owner');
        });

        User::factory(2)->create()->each(function ($user) {
            $user->assignRole('manager');
        });

        User::factory(2)->create()->each(function ($user) {
            $user->assignRole('supervisor');
        });

        User::factory(5)->create()->each(function ($user) {
            $user->assignRole('employee');
        });

        $this->command->info('10 users created with specific roles: 1 Owner, 2 Manager, 2 Supervisor, 5 Employee');
    }
}
