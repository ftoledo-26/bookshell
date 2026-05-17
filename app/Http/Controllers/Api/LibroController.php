<?php

namespace App\Http\Controllers\Api;

use App\Models\Libro;
use App\Http\Resources\LibroResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LibroController extends Controller
{
    public function index()
    {
        $libros = Libro::with('reviews.user')->get();
        return LibroResource::collection($libros);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo'           => 'required|string|max:255',
            'autor'            => 'required|string|max:255',
            'editorial'        => 'nullable|string|max:255',
            'anio_publicacion' => 'nullable|string|max:4',
            'genero'           => 'nullable|string',
            'descripcion'      => 'nullable|string',
            'foto'             => 'sometimes|nullable|file|image|max:5120',
        ]);

        if ($request->hasFile('foto')) {
            $filename = Str::slug($validated['titulo']) . '.webp';
            $request->file('foto')->move(public_path('libros'), $filename);
            $validated['foto'] = '/libros/' . $filename;
        }

        $libro = Libro::create($validated);

        return response()->json([
            'mensaje' => 'Libro creado exitosamente',
            'data'    => new LibroResource($libro),
        ], 201);
    }

    public function show(string $id)
    {
        $libro = Libro::with('reviews.user')->find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        return new LibroResource($libro);
    }

    public function update(Request $request, string $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        $validated = $request->validate([
            'titulo'           => 'sometimes|string|max:255',
            'autor'            => 'sometimes|string|max:255',
            'editorial'        => 'sometimes|nullable|string|max:255',
            'anio_publicacion' => 'sometimes|nullable|string|max:4',
            'genero'           => 'sometimes|nullable|string',
            'descripcion'      => 'sometimes|nullable|string',
            'foto'             => 'sometimes|nullable|file|image|max:5120',
        ]);

        if ($request->hasFile('foto')) {
            $filename = Str::slug($libro->titulo) . '.webp';
            $request->file('foto')->move(public_path('libros'), $filename);
            $validated['foto'] = '/libros/' . $filename;
        } else {
            unset($validated['foto']);
        }

        $libro->update($validated);

        return response()->json([
            'mensaje' => 'Libro actualizado exitosamente',
            'data'    => new LibroResource($libro),
        ]);
    }

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
        $libros = Libro::where('titulo', 'like', '%' . $title . '%')
            ->with('reviews.user')
            ->get();

        if ($libros->isEmpty()) {
            return response()->json(['mensaje' => 'No se encontraron libros con ese título'], 404);
        }

        return LibroResource::collection($libros);
    }
}
