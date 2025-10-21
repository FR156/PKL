<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Permission;
use App\Http\Requests\PermissionAttribute\AttributeRequest;

class PermissionAttributeController extends Controller
{
    /**
     * Assign attributes to a specific permission.
     */
    public function assignAttributes(AttributeRequest $request, $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return error('Permission not found', [], 404);
        }

        // sync = replace existing attributes with new ones
        $permission->attributes()->sync($request->attributes);

        return success('Attributes assigned successfully', [
            'permission' => $permission->load('attributes')
        ]);
    }

        /**
     * Unassign specific attributes from a permission.
     */
    public function unassignAttributes(AttributeRequest $request, $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return error('Permission not found', [], 404);
        }

        $attributeIds = collect($request->attributes)->pluck('attribute_id')->toArray();

        $permission->attributes()->detach($attributeIds);

        return success('Attributes unassigned successfully', [
            'permission' => $permission->load('attributes')
        ]);
    }

    /**
     * Get all attributes assigned to a specific permission.
     */
    public function getAttributes($id)
    {
        $permission = Permission::with('attributes')->find($id);

        if (!$permission) {
            return error('Permission not found', [], 404);
        }

        return success('Permission attributes retrieved successfully', [
            'permission' => $permission->only(['id', 'name']),
            'attributes' => $permission->attributes,
        ]);
    }
}
