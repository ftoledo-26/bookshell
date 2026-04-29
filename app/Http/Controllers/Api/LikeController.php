<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Like;
use App\Http\Resources\LikeResource;

class LikeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $likes = Like::with('user', 'review')->get();
        return LikeResource::collection($likes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'estado' => 'required|boolean',
            'user_id' => 'required|exists:users,id',
            'review_id' => 'required|exists:reviews,id',
        ]);

        $like = Like::create($validated);

        return response()->json([
            'mensaje' => 'Like creado exitosamente',
            'data' => new LikeResource($like)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $like = Like::with('user', 'review')->find($id);

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
        $like = Like::find($id);

        if (!$like) {
            return response()->json(['mensaje' => 'Like no encontrado'], 404);
        }

        $validated = $request->validate([
            'estado' => 'required|boolean',
            'user_id' => 'required|exists:users,id',
            'review_id' => 'required|exists:reviews,id',
        ]);

        $like->update($validated);

        return response()->json([
            'mensaje' => 'Like actualizado exitosamente',
            'data' => new LikeResource($like)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $like = Like::find($id);

        if (!$like) {
            return response()->json(['mensaje' => 'Like no encontrado'], 404);
        }

        $like->delete();

        return response()->json(['mensaje' => 'Like eliminado exitosamente']);
    }
}
