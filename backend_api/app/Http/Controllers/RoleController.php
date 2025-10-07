<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{

    // Tampilkan semua role beserta permission-nya
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json(['data' => $roles]);
    }

    // Tambah role baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name'
        ]);

        $role = Role::create(['name' => $request->name]);
        return response()->json(['message' => 'Role created successfully', 'data' => $role]);
    }

    // Ubah nama role
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $id
        ]);

        $role = Role::findOrFail($id);
        $role->update(['name' => $request->name]);

        return response()->json(['message' => 'Role updated successfully', 'data' => $role]);
    }

    // Hapus role
    public function destroy($id)
    {
        
        $role = Role::findOrFail($id);

        // detach semua permission dulu
        $role->permissions()->detach();

        // detach semua users dulu (jika ada)
        $role->users()->detach();

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }

}
