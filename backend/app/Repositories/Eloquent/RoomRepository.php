<?php

namespace App\Repositories\Eloquent;

use App\Models\Room;
use App\Repositories\Contracts\RoomRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class RoomRepository implements RoomRepositoryInterface
{
    /**
     * Get all rooms, optionally filtered.
     */
    public function all(array $filters = []): Collection
    {
        return $this->applyFilters(Room::query(), $filters)->get();
    }

    /**
     * Paginate rooms.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->applyFilters(Room::query(), $filters)->paginate($perPage);
    }

    /**
     * Find a room by its primary key.
     */
    public function find(int $id)
    {
        return Room::query()
            ->with('building')
            ->withCount([
                'reservations as todays_reservations_count' => function ($query) {
                    $query->ongoingToday();
                },
            ])
            ->with([
                'reservations' => function ($query) {
                    $query->ongoingToday()->orderBy('start_time');
                },
            ])
            ->find($id);
    }

    /**
     * Find a room by its code.
     */
    public function findByCode(string $code)
    {
        return Room::where('code', $code)->first();
    }

    /**
     * Create a new room.
     */
    public function create(array $data)
    {
        return Room::create($data);
    }

    /**
     * Update an existing room.
     */
    public function update(int $id, array $data)
    {
        $room = Room::findOrFail($id);

        $room->update($data);

        return $room;
    }

    /**
     * Delete a room.
     */
    public function delete(int $id): bool
    {
        return (bool) Room::destroy($id);
    }

    /**
     * Check whether a room already has an active reservation in the given time slot.
     */
    public function hasConflict(int $roomId, string $date, string $startTime, string $endTime, ?int $excludeReservationId = null): bool
    {
        $query = Room::findOrFail($roomId)
            ->reservations()
            ->active()
            ->whereDate('reservation_date', $date)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($q) use ($startTime, $endTime) {
                    // Existing reservation starts before our end and ends after our start.
                    $q->whereTime('start_time', '<', $endTime)
                        ->whereTime('end_time', '>', $startTime);
                });
            });

        if ($excludeReservationId !== null) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return $query->exists();
    }

    /**
     * Apply filters to the query.
     */
    private function applyFilters($query, array $filters)
    {
        $query = $query
            ->with('building')
            ->withCount([
                'reservations as todays_reservations_count' => function ($query) {
                    $query->ongoingToday();
                },
            ])
            ->with([
                'reservations' => function ($query) {
                    $query->ongoingToday()->orderBy('start_time');
                },
            ]);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['building_id'])) {
            $query->where('building_id', $filters['building_id']);
        }

        if (isset($filters['capacity_min'])) {
            $query->where('capacity', '>=', $filters['capacity_min']);
        }

        return $query->orderBy('name');
    }
}
