<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Account;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Login and issue access & refresh tokens.
     */
    public function login(LoginRequest $request)
    {
        $account = Account::where('name', $request->name)
            ->with('roles.permissions:id,name') // ambil semua permissions user
            ->first();

        if (!$account || !Hash::check($request->password, $account->password)) {
            return error('Invalid credentials');
        }

        // Hapus token lama
        $account->tokens()->whereIn('name', ['access-token', 'refresh-token'])->delete();

        $accessTTL  = config('auth.token_expiry.access', 1800); // default 30 menit
        $refreshTTL = config('auth.token_expiry.refresh', 86400); // default 24 jam

        // Buat Access Token
        $accessToken = $account->createToken('access-token', ['access'])->plainTextToken;

        // Buat Refresh Token
        $refreshToken = $account->createToken('refresh-token', ['refresh'])->plainTextToken;

        // Set expires_at untuk refresh token
        $account->tokens()
            ->where('name', 'refresh-token')
            ->update(['expires_at' => now()->addSeconds($refreshTTL)]);

        // Flatten semua permissions user
        $permissions = $account->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        return success('Login successful',  [
            'id'          => $account->id,
            'name'        => $account->name,
            'permissions' => $permissions,
            'token' => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at'    => now()->addSeconds($accessTTL)->toISOString(),
            ]
        ]);
    }

    /**
     * Refresh access token using refresh token.
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->bearerToken();

        if (!$refreshToken) {
            return error('Refresh token missing', [], 401);
        }

        $tokenModel = PersonalAccessToken::findToken($refreshToken);

        if (!$tokenModel || !$tokenModel->can('refresh') || $tokenModel->expires_at < now()) {
            return error('Refresh token expired or invalid', [], 401);
        }

        $account = $tokenModel->tokenable()->with('roles.permissions:id,name')->first();

        // Rolling refresh: perpanjang masa hidup refresh token
        $tokenModel->update(['expires_at' => now()->addSeconds(config('auth.token_expiry.refresh', 86400))]);

        // Hapus access token lama
        $account->tokens()->where('name', 'access-token')->delete();

        // Buat access token baru
        $accessToken = $account->createToken('access-token', ['access'])->plainTextToken;

        $permissions = $account->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        return success('Access token refreshed successfully', [
            'id'          => $account->id,
            'name'        => $account->name,
            'permissions' => $permissions,
            'token' => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at'    => now()->addSeconds(config('auth.token_expiry.access', 1800))->toISOString(),
            ],
        ]);
    }

    /**
     * Logout user and revoke all tokens.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return error('Unauthenticated');
        }

        $user->tokens()->whereIn('name', ['access-token', 'refresh-token'])->delete();

        return success('Logged out successfully');
    }

    /**
     * Get authenticated user + permissions.
     */
    public function getUser(Request $request)
    {
        $user = $request->user()->load('roles.permissions:id,name');

        if (!$user) {
            return error('Unauthenticated');
        }

        $permissions = $user->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        return success('Authenticated account retrieved', [
            'id'          => $user->id,
            'name'        => $user->name,
            'permissions' => $permissions,
        ]);
    }
}
