<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface RoomRepositoryInterface
{
    /**
     * Get all rooms, optionally filtered.
     */
    public function all(array $filters = []): Collection;

    /**
     * Paginate rooms.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a room by its primary key.
     */
    public function find(int $id);

    /**
     * Find a room by its code.
     */
    public function findByCode(string $code);

    /**
     * Create a new room.
     */
    public function create(array $data);

    /**
     * Update an existing room.
     */
    public function update(int $id, array $data);

    /**
     * Delete a room.
     */
    public function delete(int $id): bool;

    /**
     * Check whether a room already has an active reservation in the given time slot.
     */
    public function hasConflict(int $roomId, string $date, string $startTime, string $endTime, ?int $excludeReservationId = null): bool;
}
