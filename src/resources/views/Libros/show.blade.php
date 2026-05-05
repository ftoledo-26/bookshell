@extends('layouts.app')

@section('content')
<div class="container">
    <h1>{{ $libro->titulo }}</h1>
    <p><strong>Autor:</strong> {{ $libro->autor }}</p>
    <p><strong>Editorial:</strong> {{ $libro->editorial ?? 'No especificada' }}</p>
    <p><strong>Año de Publicación:</strong> {{ $libro->anio_publicacion ?? 'No especificado' }}</p>
    <p><strong>Género:</strong> {{ $libro->genero ?? 'No especificado' }}</p>
    <p><strong>Descripción:</strong> {{ $libro->descripcion ?? 'No hay descripción' }}</p>

    <h3>Comentarios</h3>
    <div class="mb-3">
        <a href="{{ route('libros.comentarios.desc', $libro->id) }}" class="btn btn-info">Comentarios (Mayor a Menor Valoración)</a>
        <a href="{{ route('libros.comentarios.asc', $libro->id) }}" class="btn btn-info">Comentarios (Menor a Mayor Valoración)</a>
    </div>
    @if($libro->reviews->count() > 0)
        <ul class="list-group">
            @foreach($libro->reviews as $review)
                <li class="list-group-item">
                    <strong>{{ $review->user->name }}</strong>: {{ $review->comentario }}
                    <br>
                    <small>Valoración: {{ $review->valoracion }}/5</small>
                </li>
            @endforeach
        </ul>
    @else
        <p>No hay comentarios para este libro.</p>
    @endif

    <a href="{{ route('libros.index') }}" class="btn btn-secondary">Volver a la lista</a>
    <a href="{{ route('libros.comentarios', $libro->id) }}" class="btn btn-info">Ver Todos los Comentarios</a>
</div>
@endsection