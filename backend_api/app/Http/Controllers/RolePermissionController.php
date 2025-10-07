<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{

    // Assign permissions ke role 
    public function assignPermissions(Request $request, $id)
    {
        $request->validate([
            'permissions' => 'required|array'
        ]);

        $role = Role::findOrFail($id);
        $role->syncPermissions($request->permissions);

        return response()->json(['message' => 'Permissions assigned successfully']);
    }

    // Ambil daftar permission dari role tertentu
    public function getPermissions($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json(['data' => $role->permissions]);
    }
}
