<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceReasonController;

// Public
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Protected 
Route::middleware('auth:sanctum')->group(function () {

    // Basic user actions
    Route::get('/me', [AuthController::class, 'getUser']);    
    Route::post('/logout', [AuthController::class, 'logout']); 

    // Account management (CRUD, granular)
    Route::get('/accounts', [AccountController::class, 'index'])->middleware('permission:view accounts');
    Route::post('/accounts', [AccountController::class, 'store'])->middleware('permission:create accounts');
    Route::get('/accounts/{id}', [AccountController::class, 'show'])->middleware('permission:view accounts');
    Route::put('/accounts/{id}', [AccountController::class, 'update'])->middleware('permission:edit accounts');
    Route::delete('/accounts/{id}', [AccountController::class, 'destroy'])->middleware('permission:delete accounts');

    // Role management (CRUD, granular)
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create roles');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:edit roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:delete roles');

    // Role-Permission management
    Route::post('/roles/{id}/permissions', [RolePermissionController::class, 'assignPermissions'])->middleware('permission:assign permissions to role'); 
    Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'getPermissions'])->middleware('permission:view role permissions'); 

    // Attendance management (CRUD + review)
    Route::get('/attendances', [AttendanceController::class, 'index'])->middleware('permission:view attendances');
    Route::post('/attendances/clock-in', [AttendanceController::class, 'clockIn'])->middleware('permission:create attendances');
    Route::post('/attendances/clock-out', [AttendanceController::class, 'clockOut'])->middleware('permission:create attendances');
    Route::get('/attendances/review', [AttendanceController::class, 'approved'])->middleware('permission:view approved attendances');
    Route::put('/attendances/review/{id}', [AttendanceController::class, 'review'])->middleware('permission:review attendances');
    Route::get('/attendances/{id}', [AttendanceController::class, 'show'])->middleware('permission:view attendances');
    // Route::put('/attendances/{id}', [AttendanceController::class, 'update'])->middleware('permission:edit attendances');
    Route::delete('/attendances/{id}', [AttendanceController::class, 'destroy'])->middleware('permission:delete attendances');
    // Attendance reasons management (CRUD + review)
    Route::post('/attendance-reasons', [AttendanceReasonController::class, 'store'])->middleware('permission:create attendance reasons');
    Route::put('/attendance-reasons/auto-clockout', [AttendanceReasonController::class, 'addAutoClockOutReason'])->middleware('permission:create attendance reasons');
    Route::get('/attendance-reasons/review', [AttendanceReasonController::class, 'pending'])->middleware('permission:view attendance reasons');
    Route::get('/attendance-reasons/review/{id}', [AttendanceReasonController::class, 'show'])->middleware('permission:view attendance reasons');
    Route::put('/attendance-reasons/review/{id}', [AttendanceReasonController::class, 'review'])->middleware('permission:review attendance reasons');
    Route::delete('/attendance-reasons/{id}', [AttendanceReasonController::class, 'destroy'])->middleware('permission:delete attendance reasons');
});
