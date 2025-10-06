<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsenController;

// Pastikan semua controller di sini udah di-import
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/absensi', [AbsenController::class, 'index']);
    Route::post('/absen/check-in', [AbsenController::class, 'checkIn']);
    Route::post('/absen/check-out', [AbsenController::class, 'checkOut']);
    Route::get('/absensi/all', [AbsenController::class, 'allAbsensi']);
});
