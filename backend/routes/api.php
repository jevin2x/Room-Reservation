<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuildingController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room}', [RoomController::class, 'show'])->whereNumber('room');
    Route::get('/rooms/availability', [RoomController::class, 'availability']);

    Route::get('/buildings', [BuildingController::class, 'index']);

    Route::get('/sections', [SectionController::class, 'index']);

    Route::get('/admin/sections', [AdminController::class, 'index']);
    Route::put('/admin/sections/{user}/password', [AdminController::class, 'updatePassword'])->whereNumber('user');

    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->whereNumber('reservation');
        Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])->whereNumber('reservation');
        Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])->whereNumber('reservation');
        Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])->whereNumber('reservation');
    });
});