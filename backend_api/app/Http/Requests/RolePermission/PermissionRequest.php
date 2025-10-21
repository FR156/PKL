<?php

namespace App\Http\Requests\RolePermission;

use Illuminate\Foundation\Http\FormRequest;

class PermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // atau bisa pakai Gate/Policy nanti
    }

    public function rules(): array
    {
        $isUnassign = $this->routeIs('permissions.unassignPermissions');

        return [
            'permissions'   => 'required|array|min:1',
            'permissions.*' => $isUnassign ? 'nullable' : 'string|exists:permissions,name',
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.required' => 'Permissions field is required.',
            'permissions.array'    => 'Permissions must be an array.',
            'permissions.min'      => 'At least one permission must be provided.',
            'permissions.*.string' => 'Each permission must be a valid string.',
            'permissions.*.exists' => 'Some permissions do not exist.',
        ];
    }
}
