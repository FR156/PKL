<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PermissionAttributeController;


// Public 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Protected 
Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::get('/me', [AuthController::class, 'getUser']);    
    Route::post('/logout', [AuthController::class, 'logout']); 

    // Account Management (CRUD)
    Route::prefix('accounts')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->middleware('permission:view accounts');
        Route::post('/', [AccountController::class, 'store'])->middleware('permission:create accounts');
        Route::get('/{id}', [AccountController::class, 'show'])->middleware('permission:view accounts');
        Route::put('/{id}', [AccountController::class, 'update'])->middleware('permission:edit accounts');
        Route::delete('/{id}', [AccountController::class, 'destroy'])->middleware('permission:delete accounts');
    });

    // Role Management (CRUD)
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->middleware('permission:view roles');
        Route::post('/', [RoleController::class, 'store'])->middleware('permission:create roles');
        Route::put('/{id}', [RoleController::class, 'update'])->middleware('permission:edit roles');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware('permission:delete roles');

        // Role <-> Permission relationship
        Route::post('/{id}/permissions', [RolePermissionController::class, 'assignPermissions'])
            ->middleware('permission:assign permissions to role'); 
        Route::delete('/{id}/permissions', [RolePermissionController::class, 'unassignPermissions'])
            ->middleware('permission:unassign permissions from role');
        Route::get('/{id}/permissions', [RolePermissionController::class, 'getPermissions'])
            ->middleware('permission:view role permissions');
    });

    // Permission Management (CRUD)
    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->middleware('permission:view permissions');
        Route::post('/', [PermissionController::class, 'store'])->middleware('permission:create permissions');
        Route::put('/{id}', [PermissionController::class, 'update'])->middleware('permission:edit permissions');
        Route::delete('/{id}', [PermissionController::class, 'destroy'])->middleware('permission:delete permissions');

        // Permission <-> Attribute relationship
        Route::post('/{id}/attributes', [PermissionAttributeController::class, 'assignAttributes'])
            ->middleware('permission:assign attributes to permission');
        Route::delete('/{id}/attributes', [PermissionAttributeController::class, 'unassignAttributes'])
            ->middleware('permission:unassign attributes from permission');
        Route::get('/{id}/attributes', [PermissionAttributeController::class, 'getAttributes'])
            ->middleware('permission:view permission attributes');
    });

});
