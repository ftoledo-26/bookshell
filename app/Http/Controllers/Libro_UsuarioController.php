<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class Libro_UsuarioController extends Controller
{
    public function index()
    {
        return view('libro_usuario.index');
    }
}
