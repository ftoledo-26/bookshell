<?php

namespace App\Http\Controllers\Api;


use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuario = User::with('reviews.libro')->get();
        return UserResource::collection($usuario);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $usuario = User::create([$validated]);

        return response()->json([
        'mensaje' => 'Usuario creado exitosamente',
        'data' => new UserResource($usuario)
        ], 201);
    }

   /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuario = User::with('reviews.libro')->find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        return new UserResource($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $id,
            'password' => 'string|min:8',
            'descripcion' => 'string|max:255|nullable',
        ]);

        $usuario->update($validated);

        return response()->json([
            'mensaje' => 'Usuario actualizado correctamente',
            'data' => new UserResource($usuario)
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();

        return response()->json(['mensaje' => 'Usuario eliminado correctamente'], 200);
    }

    public function searchByName($name)
    {
        if (!$name) {
            return response()->json(['mensaje' => 'El parámetro "name" es requerido'], 400);
        }

        $usuarios = User::where('name', 'like', '%' . $name . '%')->get();

        if ($usuarios->isEmpty()) {
            return response()->json(['mensaje' => 'No se encontraron usuarios con ese nombre'], 404);
        }

        return UserResource::collection($usuarios);
    }
}
