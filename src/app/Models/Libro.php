<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Libro extends Model
{
    protected $fillable = [
        'titulo',
        'autor',
        'editorial',
        'anio_publicacion',
        'genero',
        'descripcion',
        'reviews',
        'users_favoritos',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function usersFavoritos()
    {
        return $this->belongsToMany(User::class, 'users_favoritos');
    }

}
