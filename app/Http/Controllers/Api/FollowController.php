<?php

namespace App\Http\Controllers\Api;

use App\Models\Follow;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function status(Request $request, $id)
    {
        $count = Follow::where('followed_id', $id)->count();
        $isFollowing = false;

        if ($request->user()) {
            $isFollowing = Follow::where('follower_id', $request->user()->id)
                ->where('followed_id', $id)
                ->exists();
        }

        return response()->json(['followers' => $count, 'following' => $isFollowing]);
    }

    public function follow(Request $request, $id)
    {
        if ($request->user()->id == $id) {
            return response()->json(['error' => 'No puedes seguirte a ti mismo'], 422);
        }

        Follow::firstOrCreate([
            'follower_id' => $request->user()->id,
            'followed_id' => $id,
        ]);

        $count = Follow::where('followed_id', $id)->count();
        return response()->json(['followers' => $count, 'following' => true]);
    }

    public function unfollow(Request $request, $id)
    {
        Follow::where('follower_id', $request->user()->id)
            ->where('followed_id', $id)
            ->delete();

        $count = Follow::where('followed_id', $id)->count();
        return response()->json(['followers' => $count, 'following' => false]);
    }
}
