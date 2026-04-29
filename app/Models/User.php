<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'roll',
        'email',
        'phone',
        'password',
        'localidad',
        'libros',
        'reviews',
        'libros_favoritos',
        'foto',
        'descripcion',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function libros()
    {
        return $this->hasMany(Libro::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comentariosLikeados()
    {
        return $this->belongsToMany(Comentario::class, 'comentario_usuario', 'user_id', 'comentario_id')->withTimestamps();
    }
}
