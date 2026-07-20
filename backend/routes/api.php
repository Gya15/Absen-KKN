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

// HIDDEN ENDPOINT TO RESET DATABASE
Route::get('/reset-database-danger', function (\Illuminate\Http\Request $request) {
    if ($request->query('key') !== 'kkn2026') {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    // Wipe all tables and recreate them
    \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
    
    // Re-create admin
    \App\Models\User::create([
        'nim' => 'admin',
        'nama' => 'Admin KKN',
        'jurusan' => 'Admin',
        'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
        'role' => 'admin',
    ]);
    
    return response()->json(['message' => 'Database successfully wiped and reset to clean state!']);
});

// Route to serve images from local disk if S3 is not used
Route::get('/images/{path}', function ($path) {
    // Basic security check to prevent directory traversal
    $path = str_replace(['..', '/', '\\'], '', $path);
    $fullPath = 'registrasi/' . $path;
    
    if (\Illuminate\Support\Facades\Storage::disk('local')->exists($fullPath)) {
        $file = \Illuminate\Support\Facades\Storage::disk('local')->get($fullPath);
        $type = \Illuminate\Support\Facades\Storage::disk('local')->mimeType($fullPath);
        return response($file, 200)->header('Content-Type', $type);
    }
    
    abort(404, 'Image not found');
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
