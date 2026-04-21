<?php

namespace App\Http\Controllers;
use App\Models\Like;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggleLike(Request $request)
    {
        $userId = $request->input('user_id');
        $libroId = $request->input('libro_id');

        $like = Like::where('id_user', $userId)
                    ->where('id_libro', $libroId)
                    ->first();

        if ($like) {
            // Si ya existe un like, lo eliminamos (toggle off)
            $like->delete();
            return response()->json(['message' => 'Like eliminado']);
        } else {
            // Si no existe un like, lo creamos (toggle on)
            Like::create([
                'id_user' => $userId,
                'id_libro' => $libroId,
                'estado' => true,
            ]);
            return response()->json(['message' => 'Like agregado']);
        }
    }

    public function countLikes($libroId)
    {
        $likeCount = Like::where('id_libro', $libroId)->count();
        return response()->json(['like_count' => $likeCount]);
    }

    public function userLiked($userId, $libroId)
    {
        $liked = Like::where('id_user', $userId)
                     ->where('id_libro', $libroId)
                     ->exists();

        return response()->json(['liked' => $liked]);
    }
}
