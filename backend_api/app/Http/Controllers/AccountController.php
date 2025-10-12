<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    // List semua user
    public function index()
    {
        $accounts = Account::all();
        return response()->json($accounts);
    }

    // Create account baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:accounts,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
        ]);

        $account = Account::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign role otomatis
        $account->assignRole($request->role);

        return response()->json([
            'message' => 'Account created successfully',
            'account' => $account
        ]);
    }

    // Show account by ID
    public function show($id)
    {
        $account = Account::with('roles', 'permissions')->findOrFail($id);
        return response()->json($account);
    }

    // Update account
    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:accounts,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|string|exists:roles,name',
        ]);

        if($request->has('name')) $account->name = $request->name;
        if($request->has('email')) $account->email = $request->email;
        if($request->has('password')) $account->password = Hash::make($request->password);
        $account->save();

        if($request->has('role')) {
            $account->syncRoles([$request->role]); // replace old role
        }

        return response()->json([
            'message' => 'Account updated successfully',
            'account' => $account
        ]);
    }

    // Delete account
    public function destroy($id)
    {
        $account = Account::findOrFail($id);
        $account->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
