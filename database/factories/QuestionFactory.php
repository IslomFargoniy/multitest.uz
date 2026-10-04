<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'part_id' => \App\Models\Part::factory(),
            'textarea' => '<p>'.fake()->sentence().'</p>',
            'ready_second' => 5,
            'answer_second' => 30,
        ];
    }
}
