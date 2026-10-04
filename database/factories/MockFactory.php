<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mock>
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
            'user_id' => \App\Models\User\User::factory(),
            'test_id' => \App\Models\Test::factory(),
            'name' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'started_at' => now()->subHour(),
            'starts_at' => now()->subHour(),
            'finished_at' => now()->addDay(),
            'active' => true,
            'open' => true,
        ];
    }
}
