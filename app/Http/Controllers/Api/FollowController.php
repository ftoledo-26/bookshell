<?php

namespace App\Http\Controllers\Api;

use App\Models\Follow;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function status(Request $request, $id)
    {
        $count = Follow::where('followed_id', $id)->count();
        $isFollowing = false;

        $authUser = $request->user('sanctum');
        if ($authUser) {
            $isFollowing = Follow::where('follower_id', $authUser->id)
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

    public function following($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([], 404);
        }

        $followedIds = Follow::where('follower_id', $id)->pluck('followed_id');
        $users = User::whereIn('id', $followedIds)->get(['id', 'name', 'foto']);

        return response()->json($users->map(fn($u) => [
            'id'   => $u->id,
            'name' => $u->name,
            'foto' => $u->foto,
        ])->values());
    }
}
