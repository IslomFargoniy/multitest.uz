<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AttemptPart>
 */
class AttemptPartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'attempt_id' => \App\Models\Attempt::factory(),
            'part_id' => \App\Models\Part::factory(),
            'started_at' => now(),
        ];
    }
}
