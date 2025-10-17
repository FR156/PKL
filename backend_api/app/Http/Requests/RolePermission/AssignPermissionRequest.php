<?php

namespace App\Http\Requests\RolePermission;

use Illuminate\Foundation\Http\FormRequest;

class AssignPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ganti ke logic policy / gate kalau nanti ada otorisasi role tertentu
        return true;
    }

    public function rules(): array
    {
        return [
            'permissions'   => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.required' => 'Permissions field is required.',
            'permissions.array'    => 'Permissions must be sent as an array.',
            'permissions.*.exists' => 'Some permissions do not exist.',
        ];
    }
}
