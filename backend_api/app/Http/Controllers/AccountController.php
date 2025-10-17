<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Account\StoreRequest;
use App\Http\Requests\Account\UpdateRequest;

class AccountController extends Controller
{
    /**
     * Display a listing of accounts.
     */
    public function index()
    {
        $accounts = Account::with('roles')->get();

        if ($accounts->isEmpty()) {
            return error('No accounts found', [], 404);
        }

        return success('Accounts retrieved successfully', [
            'accounts' => $accounts
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(StoreRequest $request)
    {
        $account = Account::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (!$account) {
            return error('Failed to create account', [], 500);
        }

        // Assign role if provided
        if ($request->filled('role')) {
            $account->assignRole($request->role);
        }

        return success('Account created successfully', [
            'account' => $account
        ], 201);
    }

    /**
     * Display the specified account.
     */
    public function show($id)
    {
        $account = Account::with(['roles', 'permissions'])->findOrFail($id);

        return success('Account retrieved successfully', [
            'account' => $account
        ]);
    }

    /**
     * Update the specified account.
     */
    public function update(UpdateRequest $request, $id)
    {
        $account = Account::find($id);

        if (!$account) {
            return error('Account not found', [], 404);
        }

        $account->fill($request->only(['name', 'email']));

        if ($request->filled('password')) {
            $account->password = Hash::make($request->password);
        }

        $account->save();

        if ($request->filled('role')) {
            $account->syncRoles([$request->role]);
        }

        return success('Account updated successfully', [
            'account' => $account
        ]);
    }

    /**
     * Remove the specified account.
     */
    public function destroy($id)
    {
        $account = Account::find($id);

        if (!$account) {
            return error('Account not found', [], 404);
        }

        $account->delete();

        return success('Account deleted successfully');
    }
}
