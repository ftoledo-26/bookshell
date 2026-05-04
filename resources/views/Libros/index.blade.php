<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listado de Libros</title>
    <link rel="stylesheet" 
    href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
</head>
<body>
    <main class="container">

        <h1>📚 Listado de Libros</h1>

        @foreach ($libros as $libro)


            <article>
                
                <h3>📘 {{ $libro->titulo }}</h3>
                <p>Autor: {{ $libro->autor }}</p>
                <p>Editorial: {{ $libro->editorial }}</p>
                <br>
                <br>
                <strong>Opiniones</strong>
                <ul>
                    @foreach ($libro->reviews as $review)
                        <li>
                            <p>{{ $review->user?->name ?? 'Usuario desconocido' }}</p>
                            <p>{{ $review->comentario }}</p>
                        </li>
                    @endforeach
                </ul>
                @if($libro->reviews->isEmpty())
                    <small><em>🚫 No hay reseñas aún.</em></small>
                @endif
            </article>


        @endforeach

    </main>
</body>
</html>