<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Comentarios;
use App\Models\Libro_Usuario;

class Libro extends Model
{
    protected $fillable = [
        'titulo',
        'autor',
        'genero',
        'descripcion',
        'portada',
    ];

    public function comentarios(){
        return $this->hasMany(Comentario::class);
    }
    public function libro_usuario(){
        return $this->hasMany(Libro_Usuario::class);
    }
    
}
