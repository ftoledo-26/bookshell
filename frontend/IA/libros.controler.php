<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Libro;
use App\Http\Resources\LibroResource;


class LibroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $libros = Libro::all();
        return LibroResource::collection($libros);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'titulo' => 'required|string|max:255',
            'autor' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'portada' => 'nullable|string|max:255',

        ]);
        $libro = Libro::create($validate);
        return response()->json([
            'mensaje' => 'Libro Creado Correctamente',
            'data' => new LibroResource($libro)
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado juicio final'], 404);
        }

        return new LibroResource($libro);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        $validate = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'autor' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'portada' => 'nullable|string|max:255',
        ]);

        $libro->update($validate);
        return response()->json([
            'mensaje' => 'Libro actualizado correctamente',
            'data' => new LibroResource($libro)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $libro = Libro::find($id);

        if (!$libro) {
            return response()->json(['mensaje' => 'Libro no encontrado'], 404);
        }

        $libro->delete();
        return response()->json(['mensaje' => 'Libro eliminado correctamente']);
    }

    public function searchByName(Request $request){
        $query = $request->input('query');
        $libros = Libro::where('titulo', 'LIKE', '%' . $query . '%')->get();
        if ($libros->isEmpty()) {
            return response()->json(['mensaje' => 'No se encontraron libros con ese título'], 404);
        }
        return LibroResource::collection($libros);
    }
}
