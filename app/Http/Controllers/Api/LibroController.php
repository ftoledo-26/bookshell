<?php

namespace App\Http\Controllers\Api;

use App\Models\Libro;
use App\Http\Resources\LibroResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LibroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $libros = Libro::with('reviews.user')->get();
        return LibroResource::collection($libros);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
        ]);

        if ($request->hasFile('portada')) {
            $path = $request->file('portada')->store('portadas', 'public');
            $validated['portada'] = Storage::url($path);
        }

        $libro = Libro::create($validated);

        return response()->json([
            'mensaje' => 'Libro creado exitosamente',
            'data' => new LibroResource($libro)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $libro = Libro::with('reviews.user')->find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        return new LibroResource($libro);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'portada' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('portada')) {
            $path = $request->file('portada')->store('portadas', 'public');
            $validated['portada'] = Storage::url($path);
        }

        $libro->update($validated);

        return response()->json([
            'mensaje' => 'Libro actualizado exitosamente',
            'data' => new LibroResource($libro)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        $libro->delete();

        return response()->json(['mensaje' => 'Libro eliminado exitosamente']);
    }

    public function searchByTitle(string $title)
    {
        $libros = Libro::where('titulo', 'like', '%' . $title . '%')->with('reviews.user')->get();

        if ($libros->isEmpty()) {
            return response()->json(['mensaje' => 'No se encontraron libros con ese título'], 404);
        }

        return LibroResource::collection($libros);
    }
}
