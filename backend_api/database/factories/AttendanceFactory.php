<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'account_id' => 1, // sementara dummy
            'photo_path' => null,
            'location' => fake()->address(),
            'clock_in' => now()->subHours(8),
            'clock_out' => now(),
            'is_late' => fake()->boolean(),
            'status' => fake()->randomElement(['present', 'auto', 'absent']),
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}
