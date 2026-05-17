<?php

namespace App\Http\Controllers\Api;
use App\Models\Usuario;
use App\Http\Resources\UsuarioResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::all();
        return UsuarioResource::collection($usuarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:8',
        ]);
        $usuarios = Usuario::create($validate);
        return response()->json([
            'mensaje' => 'Usuario Creado Correctamente',
            'data' => new UsuarioResource($usuarios)
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        return new UsuarioResource($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        $validate = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:usuarios,email,' . $usuario->id,
            'password' => 'sometimes|required|string|min:8',
        ]);

        $usuario->update($validate);
        return response()->json([
            'mensaje' => 'Usuario actualizado correctamente',
            'data' => new UsuarioResource($usuario)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();
        return response()->json(['mensaje' => 'Usuario eliminado correctamente']);
    }

    public function blockear(string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['mensaje' => 'Usuario no encontrado'], 404);
        }

        $usuario->update(['rol' => 'bloqueado']);
        return response()->json([
            'mensaje' => 'Usuario bloqueado correctamente',
            'data' => new UsuarioResource($usuario)
        ]);
    }
}
