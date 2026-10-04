<?php

namespace Database\Factories;

use App\Models\Mock;
use App\Models\MockStudent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MockStudent>
 */
class MockStudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'mock_id' => Mock::factory(),
            'name' => fake()->name(),
            'code' => MockStudent::generateUniqueCode(),
            'attended' => false,
        ];
    }
}
