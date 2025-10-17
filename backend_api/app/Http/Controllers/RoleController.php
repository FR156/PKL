<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Requests\Role\StoreRequest;
use App\Http\Requests\Role\UpdateRequest;

class RoleController extends Controller
{
    /**
     * Display all roles with their permissions.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();

        if ($roles->isEmpty()) {
            return error('No roles found', [], 404);
        }

        return success('Roles retrieved successfully', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRequest $request)
    {
        $role = Role::create(['name' => $request->name]);

        if (!$role) {
            return error('Failed to create role', [], 500);
        }

        return success('Role created successfully', [
            'role' => $role
        ], 201);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRequest $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return error('Role not found', [], 404);
        }

        $role->update(['name' => $request->name]);

        return success('Role updated successfully', [
            'role' => $role
        ]);
    }

    /**
     * Remove the specified role.
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return error('Role not found', [], 404);
        }

        // Detach all related permissions & users before deletion
        $role->permissions()->detach();

        if (method_exists($role, 'users')) {
            $role->users()->detach();
        }

        $role->delete();

        return success('Role deleted successfully');
    }
}
