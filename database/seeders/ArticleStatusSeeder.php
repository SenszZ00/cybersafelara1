<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ArticleStatus;

class ArticleStatusSeeder extends Seeder
{
    public function run()
    {
        ArticleStatus::create(['name' => 'pending']);
        ArticleStatus::create(['name' => 'approved']);
        ArticleStatus::create(['name' => 'rejected']);
    }
}