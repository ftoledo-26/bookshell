<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Comentario;
use App\Models\Libro;
use App\Models\User;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Admin panel users
        User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'phone' => '600000001', 'roll' => 'admin', 'password' => bcrypt('password')]);
        User::create(['name' => 'User1', 'email' => 'user1@example.com', 'phone' => '600000002', 'roll' => 'user', 'password' => bcrypt('password')]);

        // App users
        $u1 = Usuario::create(['nombre' => 'Ana García', 'email' => 'ana@example.com', 'password' => bcrypt('password'), 'rol' => 'usuario']);
        $u2 = Usuario::create(['nombre' => 'Carlos López', 'email' => 'carlos@example.com', 'password' => bcrypt('password'), 'rol' => 'usuario']);

        // Categorias
        Categoria::create(['nombre' => 'Ficción']);
        Categoria::create(['nombre' => 'Ciencia ficción']);
        Categoria::create(['nombre' => 'Historia']);
        Categoria::create(['nombre' => 'Fantasía']);

        // Libros
        $l1 = Libro::create(['titulo' => 'Cien años de soledad', 'autor' => 'Gabriel García Márquez', 'genero' => 'Ficción', 'descripcion' => 'Una obra maestra del realismo mágico.']);
        $l2 = Libro::create(['titulo' => 'Dune', 'autor' => 'Frank Herbert', 'genero' => 'Ciencia ficción', 'descripcion' => 'Una épica de ciencia ficción ambientada en el planeta Arrakis.']);
        $l3 = Libro::create(['titulo' => 'El Señor de los Anillos', 'autor' => 'J.R.R. Tolkien', 'genero' => 'Fantasía', 'descripcion' => 'La gran obra de la fantasía épica.']);

        // Comentarios
        Comentario::create(['usuario_id' => $u1->id, 'libro_id' => $l1->id, 'contenido' => 'Una obra increíble, me dejó sin palabras.', 'likes' => 5]);
        Comentario::create(['usuario_id' => $u2->id, 'libro_id' => $l1->id, 'contenido' => 'El realismo mágico en su máxima expresión.', 'likes' => 3]);
        Comentario::create(['usuario_id' => $u1->id, 'libro_id' => $l2->id, 'contenido' => 'Un universo fascinante y muy bien construido.', 'likes' => 7]);
    }
}
