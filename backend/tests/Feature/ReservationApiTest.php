<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationApiTest extends TestCase
{
    use RefreshDatabase;

    private function createRoom(): Room
    {
        return Room::factory()->create([
            'building_id' => Building::factory()->create()->id,
        ]);
    }

    private function validPayload(int $roomId, array $overrides = []): array
    {
        return array_merge([
            'program' => 'BSIT',
            'section' => 'A',
            'room_id' => $roomId,
            'reservation_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'purpose' => 'Class Activity',
        ], $overrides);
    }

    public function test_anyone_can_create_reservation_with_program_and_section(): void
    {
        $room = $this->createRoom();

        $response = $this->postJson('/api/v1/reservations', $this->validPayload($room->id));

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.section.program', 'BSIT')
            ->assertJsonPath('data.section.section', 'A');

        $this->assertDatabaseHas('reservations', [
            'code' => $response->json('data.code'),
            'section_id' => $response->json('data.section_id'),
        ]);
    }

    public function test_section_dropdown_values_are_validated(): void
    {
        $room = $this->createRoom();

        $this->postJson('/api/v1/reservations', $this->validPayload($room->id, [
            'program' => 'ENGLISH',
            'section' => 'A',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors('program');

        $this->postJson('/api/v1/reservations', $this->validPayload($room->id, [
            'program' => 'BSIT',
            'section' => '1',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors('section');
    }

    public function test_conflicting_reservation_is_rejected(): void
    {
        $room = $this->createRoom();

        Reservation::factory()->create([
            'room_id' => $room->id,
            'reservation_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'status' => 'approved',
        ]);

        $response = $this->postJson('/api/v1/reservations', $this->validPayload($room->id, [
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]));

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_non_overlapping_reservation_is_allowed(): void
    {
        $room = $this->createRoom();

        Reservation::factory()->create([
            'room_id' => $room->id,
            'reservation_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'status' => 'approved',
        ]);

        $this->postJson('/api/v1/reservations', $this->validPayload($room->id, [
            'start_time' => '13:00',
            'end_time' => '14:00',
        ]))->assertStatus(201);
    }

    public function test_reservations_list_includes_section_info(): void
    {
        $room = $this->createRoom();

        $reservation = Reservation::factory()->create([
            'room_id' => $room->id,
        ]);

        $response = $this->getJson('/api/v1/reservations');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $reservation->id)
            ->assertJsonPath('data.0.section.program', $reservation->section->program)
            ->assertJsonPath('data.0.section.section', $reservation->section->section)
            ->assertJsonPath('data.0.room.id', $room->id);
    }

    public function test_reservations_can_be_filtered_by_program(): void
    {
        $room = $this->createRoom();

        Reservation::factory()->forSection([
            'program' => 'BSIT',
            'section' => 'B',
        ])->create(['room_id' => $room->id]);

        Reservation::factory()->forSection([
            'program' => 'BEED',
            'section' => 'C',
        ])->create(['room_id' => $room->id]);

        $response = $this->getJson('/api/v1/reservations?program=BSIT');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('BSIT', $response->json('data.0.section.program'));
    }

    public function test_anyone_can_cancel_reservation(): void
    {
        $reservation = Reservation::factory()->create();

        $this->postJson("/api/v1/reservations/{$reservation->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_sections_endpoint_returns_programs_and_letters(): void
    {
        $room = $this->createRoom();
        Reservation::factory()->forSection([
            'program' => 'BSIT',
            'section' => 'A',
        ])->create(['room_id' => $room->id]);

        $response = $this->getJson('/api/v1/sections');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'programs',
                    'letters',
                    'sections',
                ],
            ])
            ->assertJsonPath('data.letters.0', 'A')
            ->assertJsonPath('data.letters.25', 'Z');

        $programs = collect($response->json('data.programs'))->pluck('program');
        $this->assertTrue($programs->contains('BSIT'));
        $this->assertTrue($programs->contains('BSED'));
        $this->assertTrue($programs->contains('BEED'));
        $this->assertTrue($programs->contains('BSHM'));
    }

    public function test_rooms_are_publicly_listable(): void
    {
        $room = $this->createRoom();

        $this->getJson('/api/v1/rooms')
            ->assertOk()
            ->assertJsonPath('data.0.id', $room->id);
    }
}
