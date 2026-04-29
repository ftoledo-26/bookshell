<?php

namespace App\Http\Controllers;
use App\Models\Libro;
use Illuminate\Http\Request;

class LibrosController extends Controller
{
    public function index()
    {
        $libros = Libro::with('reviews.user')->get();
        return view('libros.index', ['libros' => $libros]);
    }

    public function show($id)
    {
        $libro = Libro::with('reviews.user')->findOrFail($id);
        return view('libros.show', ['libro' => $libro]);
    }

    public function create()
    {
        return view('libros.create');
    }

    public function store(Request $request)
    {
        $libro = new Libro();
        $libro->title = $request->input('title');
        $libro->author = $request->input('author');
        $libro->save();

        return redirect()->route('libros.index');
    }

    public function delete($id)
    {
        $libro = Libro::findOrFail($id);
        $libro->delete();

        return redirect()->route('libros.index');
    }
}
