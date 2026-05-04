<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Comentario;
use App\Models\User;

class Likes extends Model
{
    protected $table = 'comentario_usuario';

    protected $fillable = [
        'comentario_id',
        'user_id',
    ];

    public function comentario(){
        return $this->belongsTo(Comentario::class, 'comentario_id');
    }
    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }
}
