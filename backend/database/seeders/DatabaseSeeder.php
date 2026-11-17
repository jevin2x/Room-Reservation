<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Room;
use App\Models\Section;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * The school facilities available at Cordova Public College.
     *
     * @var array<int, array<string, mixed>>
     */
    private array $facilities = [
        ['name' => 'Room 201', 'code' => 'RM-201', 'capacity' => 40, 'description' => 'Standard classroom for lectures and classes.'],
        ['name' => 'Room 202', 'code' => 'RM-202', 'capacity' => 40, 'description' => 'Standard classroom for lectures and classes.'],
        ['name' => 'Room 203', 'code' => 'RM-203', 'capacity' => 40, 'description' => 'Standard classroom for lectures and classes.'],
        ['name' => 'Room 301', 'code' => 'RM-301', 'capacity' => 45, 'description' => 'Standard classroom on the third floor.'],
        ['name' => 'Room 302', 'code' => 'RM-302', 'capacity' => 45, 'description' => 'Standard classroom on the third floor.'],
        ['name' => 'Room 303', 'code' => 'RM-303', 'capacity' => 45, 'description' => 'Standard classroom on the third floor.'],
        ['name' => 'Room 401', 'code' => 'RM-401', 'capacity' => 50, 'description' => 'Large classroom on the fourth floor.'],
        ['name' => 'Room 402', 'code' => 'RM-402', 'capacity' => 50, 'description' => 'Large classroom on the fourth floor.'],
        ['name' => 'Room 403', 'code' => 'RM-403', 'capacity' => 50, 'description' => 'Large classroom on the fourth floor.'],
        ['name' => 'Lab 1', 'code' => 'LAB-1', 'capacity' => 30, 'description' => 'Computer laboratory with 30 workstations.'],
        ['name' => 'Lab 2', 'code' => 'LAB-2', 'capacity' => 30, 'description' => 'Computer laboratory with 30 workstations.'],
        ['name' => 'Lab 3', 'code' => 'LAB-3', 'capacity' => 35, 'description' => 'Computer laboratory with 35 workstations.'],
        ['name' => 'RD 1', 'code' => 'RD-1', 'capacity' => 25, 'description' => 'Research and development facility.'],
        ['name' => 'RD 2', 'code' => 'RD-2', 'capacity' => 25, 'description' => 'Research and development facility.'],
        ['name' => 'RD 3', 'code' => 'RD-3', 'capacity' => 25, 'description' => 'Research and development facility.'],
        ['name' => 'Tent 1', 'code' => 'TNT-1', 'capacity' => 120, 'description' => 'Temporary tent venue for large gatherings.'],
        ['name' => 'Tent 2', 'code' => 'TNT-2', 'capacity' => 120, 'description' => 'Temporary tent venue for large gatherings.'],
        ['name' => 'Tent 3', 'code' => 'TNT-3', 'capacity' => 120, 'description' => 'Temporary tent venue for large gatherings.'],
        ['name' => 'Tent 4', 'code' => 'TNT-4', 'capacity' => 120, 'description' => 'Temporary tent venue for large gatherings.'],
        ['name' => 'AVR', 'code' => 'AVR', 'capacity' => 80, 'description' => 'Audio Visual Room for presentations and seminars.'],
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Every program, every year (1–4), every section (A–Z).
        foreach (Section::PROGRAMS as $program => $label) {
            foreach (Section::YEARS as $year) {
                foreach (Section::SECTIONS as $letter) {
                    Section::firstOrCreate([
                        'program' => $program,
                        'year' => $year,
                        'section' => $letter,
                    ]);
                }
            }
        }

        $mainBuilding = Building::firstOrCreate([
            'code' => 'MB',
        ], [
            'name' => 'Main Building',
            'description' => 'Primary academic building.',
        ]);

        $laboratoryBuilding = Building::firstOrCreate([
            'code' => 'LB',
        ], [
            'name' => 'Laboratory Building',
            'description' => 'Houses computer and science laboratories.',
        ]);

        $rooms = [];

        foreach ($this->facilities as $facility) {
            $building = match (true) {
                str_starts_with($facility['name'], 'Lab') => $laboratoryBuilding,
                in_array($facility['name'], ['AVR'], true) => $laboratoryBuilding,
                default => $mainBuilding,
            };

            $rooms[] = Room::firstOrCreate(
                ['code' => $facility['code']],
                $facility + ['building_id' => $building->id],
            );
        }
    }
}
