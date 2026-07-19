<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

Route::get('/setup-admin', function () {
    \App\Models\User::updateOrCreate(
        ['nim' => 'admin'],
        [
            'nama' => 'Admin KKN',
            'jurusan' => 'Admin',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
        ]
    );
    return response()->json(['message' => 'Admin user created successfully!']);
});

// Authenticated routes (peserta + admin)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Attendance (peserta)
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/attendance', [AdminController::class, 'attendance']);
        Route::get('/attendance/summary', [AdminController::class, 'summary']);
        Route::get('/export', [AdminController::class, 'export']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });
});
