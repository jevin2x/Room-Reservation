<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Http\Resources\RoomResource;
use App\Services\RoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RoomController extends ApiController
{
    public function __construct(
        protected readonly RoomService $roomService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'building_id', 'capacity_min']);

        $rooms = $request->boolean('paginated')
            ? $this->roomService->paginate($filters, $request->integer('per_page', 15))
            : $this->roomService->getAll($filters);

        return $this->success(RoomResource::collection($rooms));
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $room = $this->roomService->find($id);

        if (! $room) {
            throw new NotFoundHttpException('Room not found.');
        }

        return $this->success(new RoomResource($room));
    }

    /**
     * Determine a room's availability for a given date and time.
     */
    public function availability(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $conflict = $this->roomService->hasConflict(
            (int) $request->room_id,
            $request->date,
            $request->start_time,
            $request->end_time
        );

        return $this->success([
            'available' => ! $conflict,
            'room_id' => (int) $request->room_id,
            'date' => $request->date,
        ]);
    }
}
