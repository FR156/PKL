<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /users
    public function index()
    {
        return response()->json(User::with('account')->get());
    }

    // GET /users/{id}
    public function show($id)
    {
        $user = User::with('account')->findOrFail($id);
        return response()->json($user);
    }

    // POST /users
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'nullable|exists:accounts,id',
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|unique:users,nik',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:users,email',
            'gender' => 'nullable|in:male,female',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'position' => 'nullable|string|max:255',
            'division' => 'nullable|string|max:255',
            'hired_at' => 'nullable|date',
            'employment_status' => 'nullable|in:active,resigned,terminated,retired',
        ]);

        $user = User::create($validated);
        return response()->json($user, 201);
    }

    // PUT /users/{id}
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'position' => 'nullable|string|max:255',
            'division' => 'nullable|string|max:255',
            'employment_status' => 'nullable|in:active,resigned,terminated,retired',
            'resigned_at' => 'nullable|date',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    // DELETE /users/{id}
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
