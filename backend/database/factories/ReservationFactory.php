<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->numberBetween(7, 15);
        $endHour = $startHour + fake()->numberBetween(1, 4);

        return [
            'code' => 'RES-'.now()->format('ymd').'-'.strtoupper(fake()->unique()->lexify('????')),
            'section_id' => Section::factory(),
            'room_id' => Room::factory(),
            'reservation_date' => fake()->dateTimeBetween('today', '+30 days')->format('Y-m-d'),
            'start_time' => str_pad((string) $startHour, 2, '0', STR_PAD_LEFT).':00',
            'end_time' => str_pad((string) $endHour, 2, '0', STR_PAD_LEFT).':00',
            'purpose' => fake()->randomElement([
                'Class Activity',
                'Laboratory Activity',
                'Student Meeting',
                'Seminar',
                'Examination',
                'School Event',
            ]),
            'status' => fake()->randomElement([
                'pending',
                'approved',
                'approved',
                'rejected',
                'cancelled',
            ]),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Attach the reservation to a section with the given program and letter.
     *
     * @param  array<string, string>  $attributes
     */
    public function forSection(array $attributes = []): static
    {
        return $this->state(fn () => [
            'section_id' => Section::create(
                array_merge([
                    'program' => 'BSIT',
                    'section' => 'A',
                ], $attributes)
            )->id,
        ]);
    }
}
