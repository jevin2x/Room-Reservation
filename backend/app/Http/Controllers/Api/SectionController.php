<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use Illuminate\Http\JsonResponse;

class SectionController extends ApiController
{
    /**
     * Display a listing of all sections.
     */
    public function index(): JsonResponse
    {
        $sections = Section::withCount('reservations')
            ->orderBy('program')
            ->orderBy('year')
            ->orderBy('section')
            ->get();

        $programs = collect(Section::PROGRAMS)->map(function (string $label, string $program) {
            return [
                'program' => $program,
                'label' => $label,
            ];
        })->values();

        return $this->success([
            'sections' => SectionResource::collection($sections),
            'programs' => $programs,
            'years' => Section::YEARS,
            'letters' => Section::SECTIONS,
        ]);
    }
}
