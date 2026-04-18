<?php

namespace App\Http\Controllers;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewsController extends Controller
{
    public function index()
    {
        $reviews = Review::with('libro')->get();
        return view('reviews.index', ['reviews' => $reviews]);
    }

    public function show($id)
    {
        $review = Review::with('libro')->findOrFail($id);
        return view('reviews.show', ['review' => $review]);
    }

    public function opiniones($libroId)
    {
        $reviews = Review::where('libro_id', $libroId)->get();
        return view('reviews.opiniones', ['reviews' => $reviews]);
    }
}
