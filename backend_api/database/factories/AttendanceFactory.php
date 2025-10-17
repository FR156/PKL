<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        return [
            'account_id' => Account::inRandomOrder()->first()->id ?? 1,
            'type' => $this->faker->randomElement(['clock_in', 'clock_out']),
            'timestamp' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'latitude' => $this->faker->latitude(-90, 90),
            'longitude' => $this->faker->longitude(-180, 180),
            'photo_path' => 'uploads/absen/' . $this->faker->word . '.jpg',
            'is_late' => $this->faker->boolean(20),
            'status' => $this->faker->randomElement(['approved', 'rejected']),
            'auto_clockout' => $this->faker->boolean(10),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'reason' => $this->faker->optional()->sentence(),
        ];
    }
}
