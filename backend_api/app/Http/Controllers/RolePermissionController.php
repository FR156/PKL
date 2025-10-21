<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Requests\RolePermission\PermissionRequest;

class RolePermissionController extends Controller
{
    /**
     * Assign permissions to a specific role.
     */
    public function assignPermissions(PermissionRequest $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return error('Role not found', [], 404);
        }

        $role->syncPermissions($request->permissions);

        return success('Permissions assigned successfully', [
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Unassign specific permissions from a role.
     */
    public function unassignPermissions(PermissionRequest $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return error('Role not found', 404);
        }

        $role->revokePermissionTo($request->permissions);

        return success('Permissions unassigned successfully', [
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Get all permissions assigned to a specific role.
     */
    public function getPermissions($id)
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return error('Role not found', 404);
        }

        return success('Role permissions retrieved successfully', [
            'role'        => $role->only(['id', 'name']),
            'permissions' => $role->permissions,
        ]);
    }
}
