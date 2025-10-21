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
     * 🟢 Login: issue access & refresh tokens per device
     */
    public function login(LoginRequest $request)
    {
        $account = Account::where('name', $request->name)
            ->with('roles.permissions:id,name')
            ->first();

        if (!$account || !Hash::check($request->password, $account->password)) {
            return error('Invalid credentials');
        }

        // Identifikasi nama device (fallback: 'web')
        $deviceName = $request->header('X-Device-Name') ?? 'web';

        $accessTTL  = config('auth.token_expiry.access', 900);  // 15 menit
        $refreshTTL = config('auth.token_expiry.refresh', 86400); // 24 jam

        // 🔹 Buat Access Token & Refresh Token unik per device
        $accessToken = $account->createToken("access-token-{$deviceName}", ['access'])->plainTextToken;
        $refreshToken = $account->createToken("refresh-token-{$deviceName}", ['refresh'])->plainTextToken;

        // Set expired time untuk refresh token
        $account->tokens()
            ->where('name', "refresh-token-{$deviceName}")
            ->update(['expires_at' => now()->addSeconds($refreshTTL)]);

        // Flatten permission user
        $permissions = $account->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        return success('Login successful', [
            'id'          => $account->id,
            'name'        => $account->name,
            'device'      => $deviceName,
            'permissions' => $permissions,
            'token' => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at'    => now()->addSeconds($accessTTL)->toISOString(),
            ],
        ]);
    }

    /**
     * 🔁 Refresh Access Token
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->bearerToken();
        $deviceName = $request->header('X-Device-Name') ?? 'web';

        if (!$refreshToken) {
            return error('Refresh token missing', [], 401);
        }

        $tokenModel = PersonalAccessToken::findToken($refreshToken);

        if (!$tokenModel || !$tokenModel->can('refresh') || $tokenModel->expires_at < now()) {
            return error('Refresh token expired or invalid', [], 401);
        }

        $account = $tokenModel->tokenable()->with('roles.permissions:id,name')->first();

        // Rolling refresh → perpanjang refresh token device ini saja
        $tokenModel->update([
            'expires_at' => now()->addSeconds(config('auth.token_expiry.refresh', 86400))
        ]);

        // Hapus access token lama device ini
        $account->tokens()->where('name', "access-token-{$deviceName}")->delete();

        // Buat access token baru untuk device ini
        $accessToken = $account->createToken("access-token-{$deviceName}", ['access'])->plainTextToken;

        $permissions = $account->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        return success('Access token refreshed successfully', [
            'id'          => $account->id,
            'name'        => $account->name,
            'device'      => $deviceName,
            'permissions' => $permissions,
            'token' => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at'    => now()->addSeconds(config('auth.token_expiry.access', 1800))->toISOString(),
            ],
        ]);
    }

    /**
     * 🚪 Logout (hapus token device saat ini saja)
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return error('Unauthenticated');
        }

        $currentToken = $user->currentAccessToken();
        if ($currentToken) {
            $currentToken->delete();
        }

        return success('Logged out successfully (this device only)');
    }

    /**
     * 👤 Get user & permissions
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
