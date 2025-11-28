<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Report;
use App\Models\ReportCategory;

class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'user_id' => 19, // Fixed reporter user_id
            'it_personnel_id' => 10, // Start with no IT personnel
            'report_category_id' => ReportCategory::inRandomOrder()->first()->id, // Random report category
            'anonymous_flag' => $this->faker->boolean(20),
            'description' => $this->faker->paragraph(3),
            'attachment_mime' => $this->faker->optional(0.3)->mimeType(),
            'attachment_name' => $this->faker->optional(0.3)->word() . '.' . $this->faker->fileExtension(),
            'attachment_path' => $this->faker->optional(0.3)->filePath(),
            'report_status_id' => 1, // Start all as pending
        ];
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'report_status_id' => 1,
                'it_personnel_id' => null,
            ];
        });
    }

    public function underReview()
    {
        return $this->state(function (array $attributes) {
            return [
                'report_status_id' => 2,
                'it_personnel_id' => 10, // IT personnel assigned
            ];
        });
    }

    public function resolved()
    {
        return $this->state(function (array $attributes) {
            return [
                'report_status_id' => 3,
                'it_personnel_id' => 10, // IT personnel assigned
            ];
        });
    }

    public function anonymous()
    {
        return $this->state(function (array $attributes) {
            return [
                'anonymous_flag' => true,
            ];
        });
    }

    public function notAnonymous()
    {
        return $this->state(function (array $attributes) {
            return [
                'anonymous_flag' => false,
            ];
        });
    }

    public function withCategory($categoryId)
    {
        return $this->state(function (array $attributes) use ($categoryId) {
            return [
                'report_category_id' => $categoryId,
            ];
        });
    }
}