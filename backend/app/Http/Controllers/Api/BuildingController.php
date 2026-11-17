<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Http\Resources\BuildingResource;
use App\Models\Building;
use Illuminate\Http\JsonResponse;

class BuildingController extends ApiController
{
    /**
     * Display a listing of all buildings.
     */
    public function index(): JsonResponse
    {
        $buildings = Building::withCount('rooms')->orderBy('name')->get();

        return $this->success(BuildingResource::collection($buildings));
    }
}
