<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\Permission\StoreRequest;
use App\Http\Requests\Permission\UpdateRequest;

class PermissionController extends Controller
{
    /**
     * Display all permissions with their attributes.
     */
    public function index()
    {
        $permissions = Permission::with('attributes')->get();

        if ($permissions->isEmpty()) {
            return error('No permissions found', [], 404);
        }

        return success('Permissions retrieved successfully', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(StoreRequest $request)
    {
        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => $request->guard_name ?? 'web'
        ]);

        if (!$permission) {
            return error('Failed to create permission', [], 500);
        }

        return success('Permission created successfully', [
            'permission' => $permission
        ], 201);
    }

    /**
     * Update the specified permission.
     */
    public function update(UpdateRequest $request, $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return error('Permission not found', [], 404);
        }

        $permission->update([
            'name' => $request->name,
            'guard_name' => $request->guard_name ?? $permission->guard_name
        ]);

        return success('Permission updated successfully', [
            'permission' => $permission
        ]);
    }

    /**
     * Remove the specified permission.
     */
    public function destroy($id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return error('Permission not found', [], 404);
        }

        // Detach all attributes & roles before deletion
        $permission->attributes()->detach();
        $permission->roles()->detach();

        $permission->delete();

        return success('Permission deleted successfully');
    }
}
