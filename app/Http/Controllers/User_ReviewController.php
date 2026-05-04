<?php

namespace App\Http\Controllers;
use App\Models\User_Review;
use Illuminate\Http\Request;

class User_ReviewController extends Controller
{
    public function index()
    {
        $user_reviews = User_Review::with('user', 'review')->get();
        return view('user_reviews.index', ['user_reviews' => $user_reviews]);
    }

    public function show($id)
    {
        $user_review = User_Review::with('user', 'review')->findOrFail($id);
        return view('user_reviews.show', ['user_review' => $user_review]);
    }

    public function create()
    {
        return view('user_reviews.create');
    }

    public function store(Request $request)
    {
        $user_review = new User_Review();
        $user_review->user_id = $request->input('user_id');
        $user_review->review_id = $request->input('review_id');
        $user_review->save();

        return redirect()->route('user_reviews.index');
    }

    public function delete($id)
    {
        $user_review = User_Review::findOrFail($id);
        $user_review->delete();

        return redirect()->route('user_reviews.index');
    }
}
