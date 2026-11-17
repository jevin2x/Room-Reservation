<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ReservationController extends ApiController
{
    public function __construct(
        protected readonly ReservationService $reservationService,
    ) {}

    /**
     * Display a listing of the authenticated section's reservations.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'room_id', 'date', 'search']);
        $filters['section_id'] = $request->user()->section_id;

        $reservations = $request->boolean('paginated')
            ? $this->reservationService->paginate($filters, $request->integer('per_page', 15))
            : $this->reservationService->getAll($filters);

        return $this->success(ReservationResource::collection($reservations));
    }

    /**
     * Store a newly created resource.
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['section_id'] = $request->user()->section_id;

            $reservation = $this->reservationService->create($data);

            return $this->success(new ReservationResource($reservation), 201);
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $reservation = $this->reservationService->find($id);

        $this->assertOwned($request, $reservation);

        return $this->success(new ReservationResource($reservation));
    }

    /**
     * Update the specified resource.
     */
    public function update(UpdateReservationRequest $request, int $id): JsonResponse
    {
        $reservation = $this->reservationService->find($id);

        $this->assertOwned($request, $reservation);

        try {
            $reservation = $this->reservationService->update($id, $request->validated());

            return $this->success(new ReservationResource($reservation));
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Cancel the specified reservation.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $reservation = $this->reservationService->find($id);

        $this->assertOwned($request, $reservation);

        try {
            $reservation = $this->reservationService->cancel($id);

            return $this->success(new ReservationResource($reservation));
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $reservation = $this->reservationService->find($id);

        $this->assertOwned($request, $reservation);

        $this->reservationService->delete($id);

        return response()->noContent();
    }

    /**
     * Ensure the reservation belongs to the authenticated section.
     */
    private function assertOwned(Request $request, ?Reservation $reservation): void
    {
        if (! $reservation || $reservation->section_id !== $request->user()->section_id) {
            throw new NotFoundHttpException('Reservation not found.');
        }
    }
}