<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    public const PROGRAMS = [
        'BSIT' => 'Bachelor of Science in Information Technology',
        'BSED' => 'Bachelor of Secondary Education',
        'BEED' => 'Bachelor of Elementary Education',
        'BSHM' => 'Bachelor of Science in Hospitality Management',
    ];

    public const SECTIONS = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
    ];

    public const YEARS = [1, 2, 3, 4];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'program',
        'year',
        'section',
    ];

    /**
     * Get the reservations belonging to this section.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get a readable full label for the section, e.g. "BSIT 1 – Section A".
     */
    public function getLabelAttribute(): string
    {
        return "{$this->program} {$this->year} – Section {$this->section}";
    }
}
