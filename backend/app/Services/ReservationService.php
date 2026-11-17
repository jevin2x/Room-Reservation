<?php

namespace App\Services;

use App\Repositories\Contracts\ReservationRepositoryInterface;
use App\Repositories\Contracts\RoomRepositoryInterface;
use Carbon\Carbon;
use InvalidArgumentException;

class ReservationService
{
    public function __construct(
        protected readonly ReservationRepositoryInterface $reservationRepository,
        protected readonly RoomRepositoryInterface $roomRepository,
    ) {}

    /**
     * Get all reservations, optionally filtered.
     */
    public function getAll(array $filters = [])
    {
        return $this->reservationRepository->all($filters);
    }

    /**
     * Get reservations as a paginated set.
     */
    public function paginate(array $filters = [], int $perPage = 15)
    {
        return $this->reservationRepository->paginate($filters, $perPage);
    }

    /**
     * Find a single reservation.
     */
    public function find(int $id)
    {
        return $this->reservationRepository->find($id);
    }

    /**
     * Create a new reservation after validating the time slot.
     */
    public function create(array $data)
    {
        $this->validateTimeFrame($data);

        if (empty($data['section_id'])) {
            throw new InvalidArgumentException('Your section is required.');
        }

        if ($this->roomRepository->hasConflict(
            $data['room_id'],
            $data['reservation_date'],
            $data['start_time'],
            $data['end_time']
        )) {
            throw new InvalidArgumentException(
                'The selected room is already reserved for the requested time slot.'
            );
        }

        $data['status'] = 'approved';

        return $this->reservationRepository->create($data);
    }

    /**
     * Update an existing reservation after validating the time slot.
     */
    public function update(int $id, array $data)
    {
        $reservation = $this->reservationRepository->find($id);

        if (! $reservation) {
            throw new InvalidArgumentException('Reservation not found.');
        }

        $merged = array_merge([
            'room_id' => $reservation->room_id,
            'reservation_date' => $reservation->reservation_date->format('Y-m-d'),
            'start_time' => $reservation->start_time->format('H:i'),
            'end_time' => $reservation->end_time->format('H:i'),
        ], $data);

        $this->validateTimeFrame($merged);

        if ($this->roomRepository->hasConflict(
            $merged['room_id'],
            $merged['reservation_date'],
            $merged['start_time'],
            $merged['end_time'],
            $id
        )) {
            throw new InvalidArgumentException(
                'The selected room is already reserved for the requested time slot.'
            );
        }

        return $this->reservationRepository->update($id, $merged);
    }

    /**
     * Transition a reservation to a new status.
     */
    public function updateStatus(int $id, string $status)
    {
        $allowed = [
            'pending',
            'approved',
            'rejected',
            'cancelled',
        ];

        if (! in_array($status, $allowed, true)) {
            throw new InvalidArgumentException('Invalid reservation status.');
        }

        return $this->reservationRepository->updateStatus($id, $status);
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(int $id)
    {
        $reservation = $this->reservationRepository->find($id);

        if (! $reservation) {
            throw new InvalidArgumentException('Reservation not found.');
        }

        return $this->reservationRepository->updateStatus($id, 'cancelled');
    }

    /**
     * Delete a reservation.
     */
    public function delete(int $id): bool
    {
        return $this->reservationRepository->delete($id);
    }

    /**
     * Validate that the end time is after the start time.
     */
    private function validateTimeFrame(array $data): void
    {
        $start = Carbon::createFromFormat('H:i', $data['start_time']);
        $end = Carbon::createFromFormat('H:i', $data['end_time']);

        if ($end->lessThanOrEqualTo($start)) {
            throw new InvalidArgumentException(
                'The end time must be after the start time.'
            );
        }
    }
}
