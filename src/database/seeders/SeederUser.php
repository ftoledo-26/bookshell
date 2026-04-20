<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class SeederUser extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'phone' => '600000001', 'roll' => 'admin', 'password' => bcrypt('password')]);
        User::create(['name' => 'User1', 'email' => 'user1@example.com', 'phone' => '600000002', 'password' => bcrypt('password')]);
        User::create(['name' => 'User2', 'email' => 'user2@example.com', 'phone' => '600000003', 'password' => bcrypt('password')]);
        User::create(['name' => 'User3', 'email' => 'user3@example.com', 'phone' => '600000004', 'password' => bcrypt('password')]);
    }
}
