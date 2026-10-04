<?php

namespace Database\Factories;

use App\Models\Mock;
use App\Models\Test;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mock>
 */
class MockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'test_id' => Test::factory(),
            'name' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'started_at' => now()->subHour(),
            'finished_at' => now()->addDay(),
            'active' => true,
            'open' => true,
        ];
    }
}
