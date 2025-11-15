<?php

namespace Database\Factories;

use App\Models\Feedback;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeedbackFactory extends Factory
{
    protected $model = Feedback::class;

    public function definition(): array
    {
        return [
            'user_id' => 19, // fixed user for testing
            'subject' => $this->faker->sentence(4),
            'content' => $this->faker->paragraph(3),
        ];
    }
}
