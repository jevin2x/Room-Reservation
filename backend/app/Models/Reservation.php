<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'section_id',
        'room_id',
        'reservation_date',
        'start_time',
        'end_time',
        'purpose',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reservation_date' => 'date:Y-m-d',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
        ];
    }

    /**
     * Get the section that owns this reservation.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the room being reserved.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Scope a query to only include reservations for a given room.
     */
    public function scopeForRoom($query, int $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Scope a query to only include reservations on a given date.
     */
    public function scopeOnDate($query, string $date)
    {
        return $query->whereDate('reservation_date', $date);
    }

    /**
     * Scope a query to only include active (non-cancelled) reservations.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
        ]);
    }

    /**
     * Scope a query to today's active reservations that have not ended yet.
     */
    public function scopeOngoingToday($query)
    {
        return $query
            ->active()
            ->whereDate('reservation_date', today())
            ->whereTime('end_time', '>', now()->format('H:i:s'));
    }
}
