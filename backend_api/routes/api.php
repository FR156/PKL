<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Protected 
Route::middleware('auth:sanctum')->group(function () {

    // Basic user actions
    Route::get('/user', [AuthController::class, 'getUser']);    
    Route::post('/logout', [AuthController::class, 'logout']); 

    // User management (CRUD, granular)
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view users');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create users');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:edit users');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:delete users');

    // Role management (CRUD, granular)
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create roles');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:edit roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:delete roles');

    // Role-Permission management
    Route::post('/roles/{id}/permissions', [RolePermissionController::class, 'assignPermissions'])->middleware('permission:assign permissions to role'); 
    Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'getPermissions'])->middleware('permission:view role permissions'); 

});
