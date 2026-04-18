<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\User_ReviewController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\LibrosController;
use Illuminate\Support\Facades\Route;



Route::get('/', function () {return view('index');})->name('index');


Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios');
Route::get('/usuarios/{id}', [UserController::class, 'show'])->name('usuarios.show');
Route::get('/usuarios/create', [UserController::class, 'create'])->name('usuarios.create');
Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
Route::get('/usuarios/{id}/edit', [UserController::class, 'edit'])->name('usuarios.edit');
Route::put('/usuarios/{id}', [UserController::class, 'update'])->name('usuarios.update');
Route::delete('/usuarios/{id}', [UserController::class, 'destroy'])->name('usuarios.destroy');

Route::get('/libros', [LibrosController::class, 'index'])->name('libros.index');
Route::get('/libros/create', [LibrosController::class, 'create'])->name('libros.create');
Route::post('/libros', [LibrosController::class, 'store'])->name('libros.store');
Route::get('/libros/{id}', [LibrosController::class, 'show'])->name('libros.show');
Route::get('/libros/{id}/edit', [LibrosController::class, 'edit'])->name('libros.edit');
Route::put('/libros/{id}', [LibrosController::class, 'update'])->name('libros.update');
Route::delete('/libros/{id}', [LibrosController::class, 'destroy'])->name('libros.destroy');

Route::get('/reviews', [ReviewsController::class, 'index'])->name('reviews.index');
Route::get('/reviews/{id}', [ReviewsController::class, 'show'])->name('reviews.show');
Route::get('/libros/{libroId}/opiniones', [ReviewsController::class, 'opiniones'])->name('reviews.opiniones');
Route::get('/reviews/create', [ReviewsController::class, 'create'])->name('reviews.create');
Route::post('/reviews', [ReviewsController::class, 'store'])->name('reviews.store');
Route::get('/reviews/{id}/edit', [ReviewsController::class, 'edit'])->name('reviews.edit');
Route::put('/reviews/{id}', [ReviewsController::class, 'update'])->name('reviews.update');
Route::delete('/reviews/{id}', [ReviewsController::class, 'destroy'])->name('reviews.destroy');

Route::get('/user_reviews', [User_ReviewController::class, 'index'])->name('user_reviews.index');
Route::get('/user_reviews/{id}', [User_ReviewController::class, 'show'])->name('user_reviews.show');
Route::get('/user_reviews/create', [User_ReviewController::class, 'create'])->name('user_reviews.create');
Route::post('/user_reviews', [User_ReviewController::class, 'store'])->name('user_reviews.store');
Route::get('/user_reviews/{id}/edit', [User_ReviewController::class, 'edit'])->name('user_reviews.edit');
Route::put('/user_reviews/{id}', [User_ReviewController::class, 'update'])->name('user_reviews.update');
Route::delete('/user_reviews/{id}', [User_ReviewController::class, 'destroy'])->name('user_reviews.destroy');

