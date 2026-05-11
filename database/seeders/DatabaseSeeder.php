<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'phone' => '600000001', 'roll' => 'admin', 'password' => bcrypt('password')]);
        User::create(['name' => 'User1', 'email' => 'user1@example.com', 'phone' => '600000002', 'roll' => 'user', 'password' => bcrypt('password')]);

        $this->call([
            SeederUser::class,
            LibroSeeder::class,
            ReviewSeeder::class,
        ]);
    }
}
