<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Test>
 */
class TestFactory extends Factory
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
            'language_id' => \App\Models\Language::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'is_public' => false,
        ];
    }
}
