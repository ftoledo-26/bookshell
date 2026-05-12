<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Libro;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        $libros = [
            [
                'titulo'           => 'El Gran Gatsby',
                'autor'            => 'F. Scott Fitzgerald',
                'editorial'        => 'Scribner',
                'anio_publicacion' => '1925',
                'genero'           => 'novela',
                'descripcion'      => 'En los locos años veinte, el misterioso millonario Jay Gatsby persigue obsesivamente a su amor perdido Daisy Buchanan. Una crítica despiadada al sueño americano y la decadencia de una época.',
                'foto'             => '/libros/el-gran-gatsby.webp',
            ],
            [
                'titulo'           => 'Cien Años de Soledad',
                'autor'            => 'Gabriel García Márquez',
                'editorial'        => 'Editorial Sudamericana',
                'anio_publicacion' => '1967',
                'genero'           => 'novela',
                'descripcion'      => 'La saga de la familia Buendía a lo largo de siete generaciones en el pueblo imaginario de Macondo. Obra cumbre del realismo mágico y de la literatura en lengua española.',
                'foto'             => '/libros/cien-anos-de-soledad.webp',
            ],
            [
                'titulo'           => '1984',
                'autor'            => 'George Orwell',
                'editorial'        => 'Secker & Warburg',
                'anio_publicacion' => '1949',
                'genero'           => 'ciencia_ficcion',
                'descripcion'      => 'En un futuro totalitario, Winston Smith trabaja reescribiendo la historia para el Partido. Una novela profética sobre la vigilancia masiva, la propaganda y la destrucción de la verdad.',
                'foto'             => '/libros/1984.webp',
            ],
            [
                'titulo'           => 'El Señor de los Anillos',
                'autor'            => 'J.R.R. Tolkien',
                'editorial'        => 'George Allen & Unwin',
                'anio_publicacion' => '1954',
                'genero'           => 'fantasia',
                'descripcion'      => 'La épica aventura de Frodo Bolsón para destruir el Anillo Único y salvar la Tierra Media del señor oscuro Saurón. La obra que definió el género de la fantasía moderna.',
                'foto'             => '/libros/el-senor-de-los-anillos.webp',
            ],
            [
                'titulo'           => 'Don Quijote de la Mancha',
                'autor'            => 'Miguel de Cervantes',
                'editorial'        => 'Francisco de Robles',
                'anio_publicacion' => '1605',
                'genero'           => 'novela',
                'descripcion'      => 'El hidalgo Alonso Quijano, enloquecido por los libros de caballerías, se lanza al mundo como el caballero Don Quijote. La primera novela moderna y cumbre de la literatura universal.',
                'foto'             => '/libros/don-quijote-de-la-mancha.webp',
            ],
            [
                'titulo'           => 'Harry Potter y la Piedra Filosofal',
                'autor'            => 'J.K. Rowling',
                'editorial'        => 'Bloomsbury',
                'anio_publicacion' => '1997',
                'genero'           => 'fantasia',
                'descripcion'      => 'Un niño huérfano descubre que es un mago y comienza sus estudios en Hogwarts, la escuela de magia. El inicio de la saga más vendida de la historia de la literatura juvenil.',
                'foto'             => '/libros/harry-potter-y-la-piedra-filosofal.webp',
            ],
            [
                'titulo'           => 'El Nombre de la Rosa',
                'autor'            => 'Umberto Eco',
                'editorial'        => 'Bompiani',
                'anio_publicacion' => '1980',
                'genero'           => 'misterio',
                'descripcion'      => 'El monje Guillermo de Baskerville investiga una serie de misteriosas muertes en una abadía medieval italiana. Un fascinante laberinto de signos, símbolos y secretos medievales.',
                'foto'             => '/libros/el-nombre-de-la-rosa.webp',
            ],
            [
                'titulo'           => 'La Sombra del Viento',
                'autor'            => 'Carlos Ruiz Zafón',
                'editorial'        => 'Editorial Planeta',
                'anio_publicacion' => '2001',
                'genero'           => 'misterio',
                'descripcion'      => 'En la Barcelona de posguerra, el joven Daniel descubre un libro de Julián Carax y queda atrapado en un misterio que abarca décadas. Un homenaje apasionado a la literatura y a los libros.',
                'foto'             => '/libros/la-sombra-del-viento.webp',
            ],
            [
                'titulo'           => 'El Principito',
                'autor'            => 'Antoine de Saint-Exupéry',
                'editorial'        => 'Gallimard',
                'anio_publicacion' => '1943',
                'genero'           => 'otro',
                'descripcion'      => 'Un aviador perdido en el desierto conoce a un pequeño príncipe venido de otro planeta. Un cuento poético y filosófico sobre la amistad, el amor y los valores esenciales de la vida.',
                'foto'             => '/libros/el-principito.webp',
            ],
            [
                'titulo'           => 'Crimen y Castigo',
                'autor'            => 'Fiódor Dostoyevski',
                'editorial'        => 'Russki Vestnik',
                'anio_publicacion' => '1866',
                'genero'           => 'novela',
                'descripcion'      => 'Raskólnikov, un estudiante en la miseria, asesina a una usurera creyéndose por encima de la moral ordinaria. Un profundo análisis psicológico de la culpa, el remordimiento y la redención.',
                'foto'             => '/libros/crimen-y-castigo.webp',
            ],
            [
                'titulo'           => 'Orgullo y Prejuicio',
                'autor'            => 'Jane Austen',
                'editorial'        => 'T. Egerton',
                'anio_publicacion' => '1813',
                'genero'           => 'romance',
                'descripcion'      => 'Elizabeth Bennet y el altivo señor Darcy navegan entre los prejuicios sociales y el orgullo personal en la Inglaterra rural del siglo XIX. La novela romántica más amada de la literatura inglesa.',
                'foto'             => '/libros/orgullo-y-prejuicio.webp',
            ],
            [
                'titulo'           => 'El Alquimista',
                'autor'            => 'Paulo Coelho',
                'editorial'        => 'Rocco',
                'anio_publicacion' => '1988',
                'genero'           => 'otro',
                'descripcion'      => 'El joven pastor andaluz Santiago emprende un viaje desde España hasta Egipto en busca de un tesoro, descubriendo que la verdadera riqueza está en seguir los sueños del corazón.',
                'foto'             => '/libros/el-alquimista.webp',
            ],
            [
                'titulo'           => 'Matar un Ruiseñor',
                'autor'            => 'Harper Lee',
                'editorial'        => 'J.B. Lippincott & Co.',
                'anio_publicacion' => '1960',
                'genero'           => 'novela',
                'descripcion'      => 'En el sur de Estados Unidos de los años 30, el abogado Atticus Finch defiende a un hombre negro acusado injustamente. Una novela sobre la injusticia racial, la inocencia y la integridad moral.',
                'foto'             => '/libros/matar-un-ruisenor.webp',
            ],
            [
                'titulo'           => 'El Hobbit',
                'autor'            => 'J.R.R. Tolkien',
                'editorial'        => 'George Allen & Unwin',
                'anio_publicacion' => '1937',
                'genero'           => 'fantasia',
                'descripcion'      => 'El tranquilo hobbit Bilbo Bolsón es arrastrado por el mago Gandalf y trece enanos a una peligrosa aventura para recuperar el tesoro del dragón Smaug. Precuela de El Señor de los Anillos.',
                'foto'             => '/libros/el-hobbit.webp',
            ],
            [
                'titulo'           => 'Frankenstein',
                'autor'            => 'Mary Shelley',
                'editorial'        => 'Lackington, Hughes, Harding, Mavor & Jones',
                'anio_publicacion' => '1818',
                'genero'           => 'terror',
                'descripcion'      => 'El científico Victor Frankenstein crea vida a partir de materia inerte, dando origen a una criatura que solo busca afecto. La novela que fundó la ciencia ficción y plantea las preguntas éticas de la creación.',
                'foto'             => '/libros/frankenstein.webp',
            ],
            [
                'titulo'           => 'Drácula',
                'autor'            => 'Bram Stoker',
                'editorial'        => 'Archibald Constable and Company',
                'anio_publicacion' => '1897',
                'genero'           => 'terror',
                'descripcion'      => 'El conde Drácula viaja desde Transilvania a Inglaterra para encontrar sangre nueva y expandir su dominio. La novela epistolar que definió el mito del vampiro en la cultura occidental.',
                'foto'             => '/libros/dracula.webp',
            ],
            [
                'titulo'           => 'Los Juegos del Hambre',
                'autor'            => 'Suzanne Collins',
                'editorial'        => 'Scholastic',
                'anio_publicacion' => '2008',
                'genero'           => 'ciencia_ficcion',
                'descripcion'      => 'En el futuro distópico de Panem, la joven Katniss Everdeen se ofrece voluntaria para sustituir a su hermana en los mortales Juegos del Hambre. Una crítica a los reality shows, el poder y la desigualdad.',
                'foto'             => '/libros/los-juegos-del-hambre.webp',
            ],
            [
                'titulo'           => 'El Código Da Vinci',
                'autor'            => 'Dan Brown',
                'editorial'        => 'Doubleday',
                'anio_publicacion' => '2003',
                'genero'           => 'misterio',
                'descripcion'      => 'El simbologista Robert Langdon se ve envuelto en un asesinato en el Louvre que esconde un secreto milenario sobre el Santo Grial. Un thriller vertiginoso sobre arte, religión y conspiraciones.',
                'foto'             => '/libros/el-codigo-da-vinci.webp',
            ],
            [
                'titulo'           => 'El Retrato de Dorian Gray',
                'autor'            => 'Oscar Wilde',
                'editorial'        => 'Ward Lock & Co',
                'anio_publicacion' => '1890',
                'genero'           => 'novela',
                'descripcion'      => 'El bello joven Dorian Gray vende su alma para que sea su retrato quien envejezca mientras él permanece eternamente joven. Una brillante exploración de la vanidad, la corrupción moral y la estética.',
                'foto'             => '/libros/el-retrato-de-dorian-gray.webp',
            ],
            [
                'titulo'           => 'Hamlet',
                'autor'            => 'William Shakespeare',
                'editorial'        => 'Nicholas Ling y John Trundell',
                'anio_publicacion' => '1603',
                'genero'           => 'otro',
                'descripcion'      => 'El príncipe Hamlet descubre que su tío asesinó a su padre para ocupar el trono de Dinamarca. La obra teatral más representada del mundo, un estudio inmortal sobre la duda, la traición y la venganza.',
                'foto'             => '/libros/hamlet.webp',
            ],
        ];

        foreach ($libros as $data) {
            Libro::firstOrCreate(['titulo' => $data['titulo']], $data);
        }
    }
}
