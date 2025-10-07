<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsenController;
use App\Http\Controllers\JenisCutiController;
use App\Http\Controllers\PengajuanCutiController;
use App\Http\Controllers\SaldoCutiController;

// Semua rute di dalam group ini memerlukan autentikasi dengan Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // =======================================================
    // ROUTE UNTUK FITUR ABSENSI (4 Rute)
    // =======================================================
    Route::get('/absensi', [AbsenController::class, 'index']);      // Riwayat absen pribadi
    Route::post('/absen/check-in', [AbsenController::class, 'checkIn']);
    Route::post('/absen/check-out', [AbsenController::class, 'checkOut']);
    Route::get('/absensi/all', [AbsenController::class, 'allAbsensi']); // Semua riwayat absen (Admin/HR)

    // =======================================================
    // 1. ROUTE JENIS CUTI (2 Rute: Read-Only)
    // =======================================================
    // Hanya index dan show, karena manajemen jenis cuti (store, update, destroy)
    // dianggap sebagai tugas Admin yang harus dilindungi, tapi di sini kita hilangkan dulu.
    Route::apiResource('jenis_cuti', JenisCutiController::class)
        ->only(['index', 'show'])
        ->parameters(['jenis_cuti' => 'id_jenis_cuti']);

    // =======================================================
    // 2. ROUTE PENGAJUAN CUTI (4 Rute: C-R-D)
    // =======================================================
    // Termasuk update untuk approval yang disatukan di sini.
    Route::apiResource('pengajuan_cuti', PengajuanCutiController::class)
        ->only(['index', 'show', 'store', 'destroy', 'update'])
        ->parameters(['pengajuan_cuti' => 'id_pengajuan_cuti']);

    // =======================================================
    // 3. ROUTE SALDO CUTI (4 Rute: C-R-U)
    // =======================================================
    Route::apiResource('saldo_cuti', SaldoCutiController::class)
        ->only(['index', 'show', 'store', 'update'])
        ->parameters(['saldo_cuti' => 'id_saldo_cuti']);
});
