<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ReportCategory;
use Illuminate\Database\Seeder;

class ReportCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Hardware Issue',
            'Software Issue', 
            'Network Problem',
            'Email Issue',
            'Account Access',
            'Security Concern',
            'Other',
        ];

        foreach ($categories as $name) {
            ReportCategory::firstOrCreate(['name' => $name]);
        }
    }
}