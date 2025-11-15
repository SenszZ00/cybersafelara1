<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ArticleCategory;
use Illuminate\Database\Seeder;

class ArticleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $categories = [
            'Cybersecurity',
            'Awareness',
            'Incident Report',
            'Education',
            'Technology',
        ];

        foreach ($categories as $name) {
            ArticleCategory::firstOrCreate(['name' => $name]);
        }
    }
}
