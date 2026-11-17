<?php

namespace App\Http\Resources;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $todayCount = (int) ($this->todays_reservations_count ?? 0);

        $availability = $this->status === Room::STATUS_MAINTENANCE
            ? 'maintenance'
            : ($todayCount > 0 ? 'reserved' : 'available');

        $todaySchedule = $this->relationLoaded('reservations')
            ? $this->reservations->map(fn ($reservation) => [
                'start_time' => $reservation->start_time->format('H:i'),
                'end_time' => $reservation->end_time->format('H:i'),
                'purpose' => $reservation->purpose,
                'status' => $reservation->status,
            ])->values()
            : [];

        return [
            'id' => $this->id,
            'building_id' => $this->building_id,
            'building' => $this->whenLoaded('building', fn () => new BuildingResource($this->building)),
            'name' => $this->name,
            'code' => $this->code,
            'capacity' => $this->capacity,
            'description' => $this->description,
            'image' => $this->image,
            'status' => $this->status,
            'availability' => $availability,
            'is_available' => $this->status === Room::STATUS_AVAILABLE && $todayCount === 0,
            'todays_reservations_count' => $todayCount,
            'today_schedule' => $todaySchedule,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
