<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Http\Resources\ReviewResource;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reviews = Review::with('libro', 'user')->get();
        return ReviewResource::collection($reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'libro_id' => 'required|exists:libros,id',
        'user_id' => 'required|exists:users,id',
        'rating' => 'sometimes|required|integer|min:1|max:5',
        'valoracion' => 'sometimes|required|integer|min:1|max:5',
        'comment' => 'nullable|string',
        'comentario' => 'nullable|string',
    ]);

    $payload = [
        'libro_id' => $validated['libro_id'],
        'user_id' => $validated['user_id'],
        'valoracion' => $validated['valoracion'] ?? $validated['rating'] ?? null,
        'comentario' => $validated['comentario'] ?? $validated['comment'] ?? null,
    ];

    $review = Review::create($payload);

    return response()->json([
        'mensaje' => 'Review creada exitosamente',
        'data' => new ReviewResource($review->fresh()),
    ], 201);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $review = Review::with('libro', 'user')->find($id);

        if (!$review) {
            return response()->json(['mensaje' => 'Review no encontrada'], 404);
        }

        return new ReviewResource($review);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['mensaje' => 'Review no encontrada'], 404);
        }

        $validated = $request->validate([
            'libro_id' => 'sometimes|required|exists:libros,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return response()->json([
            'mensaje' => 'Review actualizada exitosamente',
            'data' => new ReviewResource($review)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['mensaje' => 'Review no encontrada'], 404);
        }

        $review->delete();

        return response()->json(['mensaje' => 'Review eliminada exitosamente']);
    }
}
