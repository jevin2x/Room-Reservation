<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'building_id' => Building::factory(),
            'name' => fake()->unique()->words(2, true),
            'code' => fake()->unique()->lexify('??-###'),
            'capacity' => fake()->numberBetween(20, 80),
            'description' => fake()->sentence(),
            'image' => null,
            'status' => 'available',
        ];
    }
}
