<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program' => $this->program,
            'year' => $this->year,
            'section' => $this->section,
            'label' => $this->label,
            'reservations_count' => $this->whenCounted('reservations'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
