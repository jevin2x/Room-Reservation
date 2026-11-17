<?php

namespace App\Services;

use App\Repositories\Contracts\RoomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;

class RoomService
{
    public function __construct(
        protected readonly RoomRepositoryInterface $roomRepository,
    ) {}

    /**
     * Get all rooms, optionally filtered.
     */
    public function getAll(array $filters = []): Collection
    {
        return $this->roomRepository->all($filters);
    }

    /**
     * Get rooms as a paginated set.
     */
    public function paginate(array $filters = [], int $perPage = 15)
    {
        return $this->roomRepository->paginate($filters, $perPage);
    }

    /**
     * Find a single room.
     */
    public function find(int $id)
    {
        return $this->roomRepository->find($id);
    }

    /**
     * Create a new room.
     */
    public function create(array $data)
    {
        $data['status'] = $data['status'] ?? 'available';

        return $this->roomRepository->create($data);
    }

    /**
     * Update an existing room.
     */
    public function update(int $id, array $data)
    {
        return $this->roomRepository->update($id, $data);
    }

    /**
     * Delete a room. Rooms with reservations are protected from deletion.
     */
    public function delete(int $id): bool
    {
        $room = $this->roomRepository->find($id);

        if (! $room) {
            throw new InvalidArgumentException('Room not found.');
        }

        if ($room->reservations()->exists()) {
            throw new InvalidArgumentException(
                'Cannot delete a room that already has reservations.'
            );
        }

        return $this->roomRepository->delete($id);
    }

    /**
     * Check whether a room has a conflicting reservation in the given time slot.
     */
    public function hasConflict(int $roomId, string $date, string $startTime, string $endTime, ?int $excludeReservationId = null): bool
    {
        return $this->roomRepository->hasConflict(
            $roomId,
            $date,
            $startTime,
            $endTime,
            $excludeReservationId
        );
    }
}
