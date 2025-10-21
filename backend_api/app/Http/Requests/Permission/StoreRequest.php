<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Bisa kamu ubah kalau nanti mau pakai Gate/Policy
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:255|unique:permissions,name'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Permission name is required.',
            'name.string'      => 'Permission name must be a valid string.',
            'name.max'         => 'Permission name may not exceed 255 characters.',
            'name.unique'      => 'This permission name is already taken.'
        ];
    }
}
