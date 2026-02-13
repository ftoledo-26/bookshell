<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Comentario;
use App\Models\Usuario;

class Likes extends Model
{
    protected $fillable = [
        'comentario_id',
        'usuario_id',
    ];

    public function comentario(){
        return $this->belongsTo(Comentario::class, 'comentario_id');
    }
    public function usuario(){
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
