<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 🔹 Admin
        DB::table('users')->insert([
            'username' => 'CyberSafe USeP',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'college_department_id' => null, // no department
            'role' => 'admin',
            'date_joined' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 🔹 IT Personnel (one per college_department)
        $departments = DB::table('college_departments')->get();

        foreach ($departments as $index => $dept) {
            DB::table('users')->insert([
                'username' => "itp" . ($index + 1) . " - " . $dept->code, // Format: itp9 - CIC
                'email' => "itp" . ($index + 1) . "@gmail.com",
                'password' => Hash::make('itp123'),
                'college_department_id' => $dept->id, // link to department
                'role' => 'it',
                'date_joined' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}