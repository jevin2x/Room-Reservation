<?php

namespace App\Repositories\Eloquent;

use App\Models\Reservation;
use App\Repositories\Contracts\ReservationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ReservationRepository implements ReservationRepositoryInterface
{
    /**
     * Get all reservations, optionally filtered.
     */
    public function all(array $filters = []): Collection
    {
        return $this->applyFilters(Reservation::query(), $filters)->get();
    }

    /**
     * Paginate reservations.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->applyFilters(Reservation::query(), $filters)->paginate($perPage);
    }

    /**
     * Find a reservation by its primary key.
     */
    public function find(int $id)
    {
        return Reservation::with(['section', 'room.building'])->find($id);
    }

    /**
     * Find a reservation by its code.
     */
    public function findByCode(string $code)
    {
        return Reservation::with(['section', 'room.building'])->where('code', $code)->first();
    }

    /**
     * Create a new reservation.
     */
    public function create(array $data)
    {
        $data['code'] = $data['code'] ?? $this->generateCode();

        return Reservation::create($data)->load(['section', 'room.building']);
    }

    /**
     * Update an existing reservation.
     */
    public function update(int $id, array $data)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->update($data);

        return $reservation;
    }

    /**
     * Update the status of a reservation.
     */
    public function updateStatus(int $id, string $status)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->update(['status' => $status]);

        return $reservation;
    }

    /**
     * Delete a reservation.
     */
    public function delete(int $id): bool
    {
        return (bool) Reservation::destroy($id);
    }

    /**
     * Apply filters to the query.
     */
    private function applyFilters($query, array $filters)
    {
        $query = $query->with(['section', 'room.building']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['program'])) {
            $query->whereHas('section', function ($s) use ($filters) {
                $s->where('program', $filters['program']);
            });
        }

        if (isset($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        }

        if (isset($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (isset($filters['date'])) {
            $query->whereDate('reservation_date', $filters['date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('code', 'like', "%{$filters['search']}%")
                    ->orWhere('purpose', 'like', "%{$filters['search']}%")
                    ->orWhereHas('section', function ($s) use ($filters) {
                        $s->where('program', 'like', "%{$filters['search']}%")
                            ->orWhere('section', 'like', "%{$filters['search']}%");
                    });
            });
        }

        return $query->orderByDesc('reservation_date')->orderByDesc('created_at');
    }

    /**
     * Generate a unique reservation code.
     */
    private function generateCode(): string
    {
        do {
            $code = 'RES-'.now()->format('ymd').'-'.strtoupper(uniqid());
        } while (Reservation::where('code', $code)->exists());

        return $code;
    }
}
