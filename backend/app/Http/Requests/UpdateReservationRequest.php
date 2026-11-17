<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('reservation_date')) {
            $this->merge([
                'reservation_date' => Carbon::parse($this->reservation_date)->format('Y-m-d'),
            ]);
        }

        if ($this->has('start_time')) {
            $this->merge([
                'start_time' => Carbon::parse($this->start_time)->format('H:i'),
            ]);
        }

        if ($this->has('end_time')) {
            $this->merge([
                'end_time' => Carbon::parse($this->end_time)->format('H:i'),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['sometimes', 'exists:rooms,id'],
            'reservation_date' => ['sometimes', 'date', 'after_or_equal:today'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'purpose' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
