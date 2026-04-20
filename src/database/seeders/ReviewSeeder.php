<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Libro;
use App\Models\Review;
use App\Models\User;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Review::create([
            
            'comentario' => 'Excelente libro, muy recomendable.',
            'valoracion' => 5,
            'libro_id' => 1,
            'user_id' => 2,
        ]);

        Review::create([
            'comentario' => 'No me gustó mucho, esperaba más.',
            'valoracion' => 2,
            'libro_id' => 1,
            'user_id' => 3,
        ]);

        Review::create([
            'comentario' => 'Un libro decente, pero no es mi favorito.',
            'valoracion' => 3,
            'libro_id' => 2,
            'user_id' => 2,
        ]);

        Review::create([
            'comentario' => 'Me encantó la historia y los personajes.',
            'valoracion' => 4,
            'libro_id' => 2,
            'user_id' => 3,
        ]);

        Review::create([
            'comentario' => 'Un clásico que todos deberían leer.',
            'valoracion' => 5,
            'libro_id' => 3,
            'user_id' => 2,
        ]);

        Review::create([
            'comentario' => 'No es tan bueno como esperaba.',
            'valoracion' => 2,
            'libro_id' => 3,
            'user_id' => 3,
        ]);

        Review::create([
            'comentario' => 'Una aventura épica que me mantuvo enganchado.',
            'valoracion' => 5,
            'libro_id' => 4,
            'user_id' => 2,
        ]);

        Review::create([
            'comentario' => 'Demasiado largo para mi gusto.',
            'valoracion' => 3,
            'libro_id' => 4,
            'user_id' => 3,
        ]);

        Review::create([
            'comentario' => 'Una obra maestra de la literatura.',
            'valoracion' => 5,
            'libro_id' => 1,
            'user_id' => 4,
        ]);
    }
}
