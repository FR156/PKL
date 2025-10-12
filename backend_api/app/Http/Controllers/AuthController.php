<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Account;

class AuthController extends Controller
{
    // Login user dan buat token baru
    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'password' => 'required',
        ]);

        // Cari user berdasarkan name
        $account = Account::where('name', $request->name)->first();

        // Cek apakah user ada dan password cocok
        if (!$account || !Hash::check($request->password, $account->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Hapus token lama (opsional, biar gak numpuk)
        $account->tokens()->delete();

        // Buat token baru
        $token = $account->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $account,
            'token' => $token,
        ]);
    }

    // Logout user (hapus token)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // Ambil data user yang sedang login
    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }
}
