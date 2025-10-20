<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /users
    public function index()
    {
        $users = User::with('account')->get();
        return success('Users retrieved successfully', $users);
    }

    // GET /users/{id}
    public function show($id)
    {
        $user = User::with('account')->find($id);

        if (! $user) {
            return error('User not found');
        }

        return success('User retrieved successfully', $user);
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
        return success('User created successfully', $user);
    }

    // PUT /users/{id}
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return error('User not found');
        }

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'position' => 'nullable|string|max:255',
            'division' => 'nullable|string|max:255',
            'employment_status' => 'nullable|in:active,resigned,terminated,retired',
            'resigned_at' => 'nullable|date',
        ]);

        $user->update($validated);
        return success('User updated successfully', $user);
    }

    // DELETE /users/{id}
    public function destroy($id)
    {
        $user = User::find($id);

        if (! $user) {
            return error('User not found');
        }

        $user->delete();
        return success('User deleted successfully');
    }
}
