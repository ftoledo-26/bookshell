<?php

namespace App\Http\Controllers;
use App\Models\Libro;
use Illuminate\Http\Request;

class LibrosController extends Controller
{
    public function index()
    {
        $libros = Libro::with('reviews.user')
            ->withAvg('reviews', 'valoracion')
            ->get();
        return view('libros.index', ['libros' => $libros]);
    }

    public function show($id)
    {
        $libro = Libro::with('reviews.user')->findOrFail($id);
        return view('libros.show', ['libro' => $libro]);
    }

    public function buscar(Request $request)
    {
        $query = $request->input('query');
        $libros = Libro::where('title', 'like', '%' . $query . '%')
            ->orWhere('author', 'like', '%' . $query . '%')
            ->get();

        return view('libros.index', ['libros' => $libros]);
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

    public function comentarios($id)
    {
        $libro = Libro::findOrFail($id);
        $comentarios = $libro->reviews()->with('user')->get();
        return view('libros.comentarios', ['libro' => $libro, 'comentarios' => $comentarios]);
    }

    public function topRated()
    {
        $libros = Libro::with('reviews')
            ->withAvg('reviews', 'valoracion')
            ->orderBy('reviews_avg_valoracion', 'desc')
            ->get();
        return view('libros.index', ['libros' => $libros]);
    }

    public function comentariosDesc($id)
    {
        $libro = Libro::findOrFail($id);
        $comentarios = $libro->reviews()->with('user')->orderBy('valoracion', 'desc')->get();
        return view('libros.comentarios', ['libro' => $libro, 'comentarios' => $comentarios]);
    }

    public function comentariosAsc($id)
    {
        $libro = Libro::findOrFail($id);
        $comentarios = $libro->reviews()->with('user')->orderBy('valoracion', 'asc')->get();
        return view('libros.comentarios', ['libro' => $libro, 'comentarios' => $comentarios]);
    }
}