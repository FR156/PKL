<?php

namespace App\Helpers;

use Illuminate\Support\Carbon;

class TokenStorage
{
    protected static $tokens = [];

    public static function store($userId, $refreshToken)
    {
        self::$tokens[$refreshToken] = [
            'user_id' => $userId,
            'expires_at' => Carbon::now()->addDays(1),
        ];
    }

    public static function get($refreshToken)
    {
        $token = self::$tokens[$refreshToken] ?? null;

        if (! $token) {
            return null;
        }

        // Cek expired
        if ($token['expires_at']->isPast()) {
            unset(self::$tokens[$refreshToken]);
            return null;
        }

        return $token;
    }

    public static function remove($refreshToken)
    {
        unset(self::$tokens[$refreshToken]);
    }
}
