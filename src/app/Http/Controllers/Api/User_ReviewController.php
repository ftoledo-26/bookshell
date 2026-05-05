<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User_Review as UserReviewModel;
use App\Http\Resources\User_Review;

class User_ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user_reviews = UserReviewModel::with('user', 'review')->get();
        return User_Review::collection($user_reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'review_id' => 'required|exists:reviews,id',
        ]);

        $user_review = UserReviewModel::create($validated);

        return response()->json([
            'mensaje' => 'User_Review creado exitosamente',
            'data' => new User_Review($user_review)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user_review = UserReviewModel::with('user', 'review')->find($id);

        if (!$user_review) {
            return response()->json(['mensaje' => 'User_Review no encontrado'], 404);
        }

        return new User_Review($user_review);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user_review = UserReviewModel::find($id);

        if (!$user_review) {
            return response()->json(['mensaje' => 'User_Review no encontrado'], 404);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'review_id' => 'required|exists:reviews,id',
        ]);

        $user_review->update($validated);

        return response()->json([
            'mensaje' => 'User_Review actualizado exitosamente',
            'data' => new User_Review($user_review)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user_review = UserReviewModel::find($id);

        if (!$user_review) {
            return response()->json(['mensaje' => 'User_Review no encontrado'], 404);
        }

        $user_review->delete();

        return response()->json(['mensaje' => 'User_Review eliminado exitosamente']);
    }
}
