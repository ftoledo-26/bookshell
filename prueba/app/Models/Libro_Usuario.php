<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Libro_Usuario extends Model
{
    protected $fillable = [
        'libro_id',
        'usuario_id',
        'estado',
    ];

    public function libro(){
        return $this->belongsTo(Libro::class, 'libro_id');
    }

    public function usuario(){
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
