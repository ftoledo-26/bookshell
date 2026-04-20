<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ComentarioController extends Controller
{
    public function index()
    {
        return view('comentario.index');
    }
}
