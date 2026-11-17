<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ReservationRepositoryInterface
{
    /**
     * Get all reservations, optionally filtered.
     */
    public function all(array $filters = []): Collection;

    /**
     * Paginate reservations.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a reservation by its primary key.
     */
    public function find(int $id);

    /**
     * Find a reservation by its code.
     */
    public function findByCode(string $code);

    /**
     * Create a new reservation.
     */
    public function create(array $data);

    /**
     * Update an existing reservation.
     */
    public function update(int $id, array $data);

    /**
     * Update the status of a reservation.
     */
    public function updateStatus(int $id, string $status);

    /**
     * Delete a reservation.
     */
    public function delete(int $id): bool;
}
