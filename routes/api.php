<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LibroController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\User_ReviewController;
use App\Http\Controllers\Api\AuthController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ----------------------------------------------------------------------
// -------------------------- RUTAS PARA USUARIOS -----------------------
// ----------------------------------------------------------------------

// Autenticación básica

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');


// ----------------------------------------------------------------------
// -------------------------- RUTAS PÚBLICAS ----------------------------
// ----------------------------------------------------------------------

Route::get('/usuarios', [UserController::class, 'index']);
Route::get('/usuarios/{id}', [UserController::class, 'show']);
Route::get('/usuarios/buscar/{name}', [UserController::class, 'searchByName']);
Route::get('/libros', [LibroController::class, 'index']);
Route::get('/libros/{id}', [LibroController::class, 'show']);
Route::get('/libros/buscar/{title}', [LibroController::class, 'searchByTitle']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{id}', [ReviewController::class, 'show']);
Route::get('/libros/{libroId}/opiniones', [ReviewController::class, 'opiniones']);
Route::get('/user_reviews', [User_ReviewController::class, 'index']);
Route::get('/user_reviews/{id}', [User_ReviewController::class, 'show']);


// ----------------------------------------------------------------------
// -------------------------- RUTAS PRIVADAS ----------------------------
// ----------------------------------------------------------------------


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/libros', [LibroController::class, 'store']);
    Route::put('/libros/{id}', [LibroController::class, 'update']);
    Route::delete('/libros/{id}', [LibroController::class, 'destroy']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::post('/user_reviews', [User_ReviewController::class, 'store']);
    Route::put('/user_reviews/{id}', [User_ReviewController::class, 'update']);
    Route::delete('/user_reviews/{id}', [User_ReviewController::class, 'destroy']);
}); 
