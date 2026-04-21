<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LibrosController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/libros/{id}/comentarios', [LibrosController::class, 'comentarios'])->name('libros.comentarios');

Route::get('/libros/top-rated', [LibrosController::class, 'topRated'])->name('libros.topRated');
