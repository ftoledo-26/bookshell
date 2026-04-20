<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    protected $fillable = ['contenido','usuario_id','libro_id','likes'];

    public function libro(){
        return $this->belongsTo(Libro::class);
    }
    public function usuario(){
        return $this->belongsTo(Usuario::class);
    }
    
}
