<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Bisa kamu ubah kalau mau pake policy/permission check
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:roles,name',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique'   => 'This role name is already taken.',
            'name.string'   => 'Role name must be a valid string.',
            'name.max'      => 'Role name may not be greater than 255 characters.',
        ];
    }
}
