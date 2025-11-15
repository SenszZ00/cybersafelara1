<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use App\Models\ArticleCategory;
use App\Models\ArticleStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // Use factory or existing user ID
            'category_id' => ArticleCategory::factory(),
            'article_status_id' => 1, // 1 = pending (using the new foreign key)
            'title' => $this->faker->sentence(),
            'keyword' => $this->faker->word(),
            'content' => $this->faker->paragraph(6),
            // Remove this: 'status' => $this->faker->word('pending'),
        ];
    }

    // Optional: Add state methods for different statuses
    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'article_status_id' => 2, // 2 = approved
            ];
        });
    }

    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'article_status_id' => 3, // 3 = rejected
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'article_status_id' => 1, // 1 = pending
            ];
        });
    }
}