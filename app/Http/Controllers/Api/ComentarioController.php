<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comentario;
use App\Http\Resources\ComentarioResource;

class ComentarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $comentarios = Comentario::all();
        return ComentarioResource::collection($comentarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'usuario_id' => 'required|integer',
            'libro_id' => 'required|integer',
            'contenido' => 'required|string',
        ]);
        $comentario = Comentario::create($validate);
        return response()->json([
            'mensaje' => 'Comentario Creado Correctamente',
            'data' => new ComentarioResource($comentario)
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $comentario = Comentario::find($id);

        if (!$comentario) {
            return response()->json(['mensaje' => 'Comentario no encontrado'], 404);
        }

        return new ComentarioResource($comentario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $comentario = Comentario::find($id);

        if (!$comentario) {
            return response()->json(['mensaje' => 'Comentario no encontrado'], 404);
        }

        $validate = $request->validate([
            'usuario_id' => 'sometimes|required|integer',
            'libro_id' => 'sometimes|required|integer',
            'contenido' => 'sometimes|required|string',
        ]);

        $comentario->update($validate);
        return response()->json([
            'mensaje' => 'Comentario actualizado correctamente',
            'data' => new ComentarioResource($comentario)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $comentario = Comentario::find($id);

        if (!$comentario) {
            return response()->json(['mensaje' => 'Comentario no encontrado'], 404);
        }

        $comentario->delete();
        return response()->json(['mensaje' => 'Comentario eliminado correctamente']);
    }
}
