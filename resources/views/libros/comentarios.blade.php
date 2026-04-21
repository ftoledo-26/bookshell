@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Comentarios para {{ $libro->titulo }}</h1>
    @if($comentarios->count() > 0)
        <ul class="list-group">
            @foreach($comentarios as $comentario)
                <li class="list-group-item">
                    <strong>{{ $comentario->user->name }}</strong>: {{ $comentario->comentario }}
                    <br>
                    <small>Valoración: {{ $comentario->valoracion }}/5</small>
                </li>
            @endforeach
        </ul>
    @else
        <p>No hay comentarios para este libro.</p>
    @endif
    <a href="{{ route('libros.show', $libro->id) }}" class="btn btn-primary">Volver al libro</a>
</div>
@endsection