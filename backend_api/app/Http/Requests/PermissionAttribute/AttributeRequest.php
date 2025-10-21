<?php

namespace App\Http\Requests\PermissionAttribute;

use Illuminate\Foundation\Http\FormRequest;

class AttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // bisa kamu ganti kalau nanti pakai policy
    }

    public function rules(): array
    {
        $isUnassign = $this->routeIs('permissions.unassignAttributes');

        return [
            'attributes' => 'required|array|min:1',
            'attributes.*.attribute_id' => 'required|integer|exists:attributes,id',
            'attributes.*.access_type' => $isUnassign ? 'nullable' : 'nullable|in:read,write,both',
        ];
    }

    public function messages(): array
    {
        return [
            'attributes.required' => 'Attributes field is required.',
            'attributes.array'    => 'Attributes must be sent as an array.',
            'attributes.min'      => 'At least one attribute must be provided.',

            'attributes.*.attribute_id.required' => 'Each attribute must include an attribute_id.',
            'attributes.*.attribute_id.exists'   => 'Some attributes do not exist.',
            'attributes.*.attribute_id.integer'  => 'Each attribute_id must be an integer.',

            'attributes.*.access_type.in'        => 'Access type must be one of: read, write, or both.',
        ];
    }
}
