<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Libro_Usuario;
use App\Http\Resources\Libro_UsuarioResource;

class Libro_UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $libro_usuarios = Libro_Usuario::all();
        return Libro_UsuarioResource::collection($libro_usuarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'usuario_id' => 'required|integer',
            'libro_id' => 'required|integer',
        ]);
        $libro_usuario = Libro_Usuario::create($validate);
        return response()->json([
            'mensaje' => 'Libro_Usuario Creado Correctamente',
            'data' => new Libro_UsuarioResource($libro_usuario)
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $libro_usuario = Libro_Usuario::find($id);

        if (!$libro_usuario) {
            return response()->json(['mensaje' => 'Libro_Usuario no encontrado'], 404);
        }

        return new Libro_UsuarioResource($libro_usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $libro_usuario = Libro_Usuario::find($id);

        if (!$libro_usuario) {
            return response()->json(['mensaje' => 'Libro_Usuario no encontrado'], 404);
        }

        $validate = $request->validate([
            'usuario_id' => 'sometimes|required|integer',
            'libro_id' => 'sometimes|required|integer',
        ]);

        $libro_usuario->update($validate);
        return response()->json([
            'mensaje' => 'Libro_Usuario actualizado correctamente',
            'data' => new Libro_UsuarioResource($libro_usuario)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $libro_usuario = Libro_Usuario::find($id);

        if (!$libro_usuario) {
            return response()->json(['mensaje' => 'Libro_Usuario no encontrado'], 404);
        }

        $libro_usuario->delete();
        return response()->json(['mensaje' => 'Libro_Usuario eliminado correctamente']);    
    }
}
