<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Login (tidak perlu auth)
Route::post('/login', [AuthController::class, 'login']);

// Logout & get user (protected, harus login)
Route::middleware('auth:sanctum')->group(function () {
    // Ambil user yang login
    Route::get('/user', [AuthController::class, 'getUser']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // CRUD user / hanya admin yang boleh akses
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        // nanti bisa tambah create, update, delete user di sini
    });
});
