<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\LibroController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\Libro_UsuarioController;
use App\Http\Controllers\Api\LikeController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('usuarios', UsuarioController::class, ['as' => 'api']);

Route::apiResource('libros', LibroController::class, ['as' => 'api']);

Route::apiResource('comentarios', ComentarioController::class, ['as' => 'api']);

Route::apiResource('libroUsuario', Libro_UsuarioController::class, ['as' => 'api']);

Route::apiResource('likes', LikeController::class, ['as'=> 'api']);

//////////////          POST                //////////////////////////

Route::post('usuarios', [UsuarioController::class, 'store'])
    ->name('api.usuarios.store');

Route::post('libros', [LibroController::class, 'store'])
    ->name('api.libros.store');

Route::post('comentarios', [ComentarioController::class, 'store'])
    ->name('api.comentarios.store');
    