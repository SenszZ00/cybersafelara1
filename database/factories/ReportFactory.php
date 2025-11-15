<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Report;
use App\Models\ReportLog;
use App\Models\ReportStatus;

class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'user_id' => 29, // Fixed reporter user_id
            'it_personnel_id' => 10, // Start with no IT personnel
            'anonymous_flag' => $this->faker->boolean(20),
            'incident_type' => $this->faker->randomElement([
                'Hardware Issue',
                'Software Issue',
                'Network Problem',
                'Security Concern',
                'Account Access',
                'Other'
            ]),
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
}