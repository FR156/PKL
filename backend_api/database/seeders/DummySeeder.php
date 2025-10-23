<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Account;
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

        Account::factory(1)->create()->each(function ($account) {
            $account->assignRole('owner');
        });

        Account::factory(2)->create()->each(function ($account) {
            $account->assignRole('manager');
        });

        Account::factory(2)->create()->each(function ($account) {
            $account->assignRole('supervisor');
        });

        Account::factory(4)->create()->each(function ($account) {
            $account->assignRole('employee');
        });

        

        $this->command->info('10 users created with specific roles: 1 Owner, 2 Manager, 2 Supervisor, 5 Employee, now Ammar is part of the team!');
    }
}
