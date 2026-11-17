<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
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
        $this->merge([
            'reservation_date' => Carbon::parse($this->reservation_date)->format('Y-m-d'),
            'start_time' => Carbon::parse($this->start_time)->format('H:i'),
            'end_time' => Carbon::parse($this->end_time)->format('H:i'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'exists:rooms,id'],
            'reservation_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => [
                'required',
                'date_format:H:i',
                function ($attribute, $value, $fail) {
                    if (
                        $this->reservation_date === now()->toDateString()
                        && Carbon::parse($value)->lte(now())
                    ) {
                        $fail('The start time must still be in the future.');
                    }
                },
            ],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'purpose' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_id.required' => 'Please select a room.',
            'end_time.after' => 'The end time must be after the start time.',
            'reservation_date.after_or_equal' => 'The reservation date cannot be in the past.',
            'start_time.in_future' => 'The start time must still be in the future.',
        ];
    }
}