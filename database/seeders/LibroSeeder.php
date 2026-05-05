<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Libro;
use App\Models\Review;
use App\Models\User;

class LibroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Libro::create([
            'titulo' => 'El Gran Gatsby',
            'autor' => 'F. Scott Fitzgerald',

            'genero' => 'novela',
            'descripcion' => 'Una historia de amor y tragedia en la era del jazz.',
        ]);

        Libro::create([
            'titulo' => 'Cien Años de Soledad',
            'autor' => 'Gabriel García Márquez',

            'genero' => 'ciencia_ficcion',
            'descripcion' => 'La historia de la familia Buendía en el pueblo ficticio de Macondo.',
        ]);

        Libro::create([
            'titulo' => '1984',
            'autor' => 'George Orwell',

            'genero' => 'misterio',
            'descripcion' => 'Una visión sombría de un futuro totalitario.',
        ]);

        Libro::create([
            'titulo' => 'El Señor de los Anillos',
            'autor' => 'J.R.R. Tolkien',
  
            'genero' => 'fantasia',
            'descripcion' => 'Una épica aventura en la Tierra Media.',
        ]);
    }
}
