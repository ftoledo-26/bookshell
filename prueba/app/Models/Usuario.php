<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $fillable = ['nombre', 'email', 'password', 'rol', 'foto'];

    public function comentarios(){
        return $this->hasMany(Comentario::class);
    }

    public function likes(){
        return $this->hasMany(Like::class);
    }

    public function libros_usuarios(){
        return $this->hasMany(Libro_Usuario::class);
    }
}
