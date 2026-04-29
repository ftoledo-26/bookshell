<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['nombre', 'email', 'password', 'rol', 'foto'];

    protected $hidden = ['password'];

    public function comentarios(){
        return $this->hasMany(Comentario::class);
    }

    public function likes(){
        return $this->hasMany(Likes::class);
    }

    public function libros_usuarios(){
        return $this->hasMany(Libro_Usuario::class);
    }
}
