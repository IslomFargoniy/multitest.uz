<?php

use App\Http\Controllers\Api\AttemptController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\MockController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for MultiTest Android & Mobile Apps
|--------------------------------------------------------------------------
*/

// 🔑 Public Auth Routes
Route::prefix('v1/auth')->group(function () {
    Route::post('login', [LoginController::class, 'login']);
    Route::post('login-otp', [LoginController::class, 'loginWithOtp']);
    Route::post('google', [LoginController::class, 'loginWithGoogle']);
});

// Backward compatibility with prava24 style endpoints
Route::prefix('auth')->group(function () {
    Route::post('login-otp', [LoginController::class, 'loginWithOtp']);
    Route::post('google', [LoginController::class, 'loginWithGoogle']);
});

// 📚 Public Tests Catalog
Route::prefix('v1')->group(function () {
    Route::get('tests', [TestController::class, 'index']);
    Route::get('tests/{id}', [TestController::class, 'show']);
});

// 🔒 Protected Authenticated Routes (Bearer Token)
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // User Profile
    Route::get('auth/me', [UserController::class, 'profile']);
    Route::post('auth/logout', function () {
        auth()->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Tizimdan chiqildi.']);
    });
    Route::post('user/update', [UserController::class, 'update']);

    // Mock Exam
    Route::post('mocks/join', [MockController::class, 'join']);

    // Speaking Exam Attempts Engine
    Route::post('attempts/start', [AttemptController::class, 'start']);
    Route::get('attempts/{id}', [AttemptController::class, 'show']);
    Route::post('attempts/{attempt_part_id}/upload-answers', [AttemptController::class, 'uploadPartAnswers']);
    Route::post('attempts/{id}/finish', [AttemptController::class, 'finish']);
    Route::post('attempts/{id}/violation', [AttemptController::class, 'recordViolation']);
    Route::get('my-attempts', [AttemptController::class, 'myAttempts']);
});
