<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Likes;
use App\Http\Resources\LikeResource;

class LikeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $like = Likes::all();
        return LikeResource::collection($like);
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
        $like = Likes::create($validate);
        return response()->json([
            'mensaje' => 'Like Creado Correctamente',
            'data' => new LikeResource($like)
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $like = Likes::find($id);

        if (!$like) {
            return response()->json(['mensaje' => 'Like no encontrado'], 404);
        }

        return new LikeResource($like);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $like = Likes::find($id);

        if (!$like){
            return response()->json(['mensaje' => 'Like no encontrado'], 404);
        }

        $validate = $request->validate([
            'usuario_id' => 'sometimes|required|integer',
            'libro_id' => 'sometimes|required|integer',
        ]);
        $like->update($validate);
        return response()->json([
            'mensaje' => 'Like actualizado correctamente',
            'data' => new LikeResource($like)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $like = Likes::find($id);

        if (!$like) {
            return response()->json(['mensaje' => 'Like no encontrado'], 404);
        }

        $like->delete();
        return response()->json(['mensaje' => 'Like eliminado correctamente']);
    }
}
