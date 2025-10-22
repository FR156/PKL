<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class ClockOutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'timestamp' => 'required|date',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'photo_path' => 'required|string|max:255',
            'description' => 'required_if:is_early,true|string|max:500',
        ];
    }

    public function getTimestamp(): Carbon
    {
        return Carbon::parse($this->timestamp);
    }

    public function messages(): array
    {
        return [
            'timestamp.required' => 'Timestamp is required',
            'timestamp.date' => 'Timestamp must be a valid date',
            'latitude.required' => 'Latitude is required',
            'latitude.numeric' => 'Latitude must be a number',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'longitude.required' => 'Longitude is required',
            'longitude.numeric' => 'Longitude must be a number',
            'longitude.between' => 'Longitude must be between -180 and 180',
            'photo_path.required' => 'Photo path is required',
            'photo_path.string' => 'Photo path must be a string',
            'photo_path.max' => 'Photo path may not be greater than 255 characters',
            'auto_clockout.boolean' => 'Auto clockout must be true or false',
            'description.string' => 'Description must be a string',
            'description.max' => 'Description may not be greater than 500 characters',
        ];
    }
}
