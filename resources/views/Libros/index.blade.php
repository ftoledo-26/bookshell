@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Libros</h1>
    <a href="{{ route('libros.topRated') }}" class="btn btn-secondary mb-3">Ordenar por Valoración</a>
    @if($libros->count() > 0)
        <div class="row">
            @foreach($libros as $libro)
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">{{ $libro->titulo }}</h5>
                            <p class="card-text">Autor: {{ $libro->autor }}</p>
                            @if($libro->reviews_avg_valoracion)
                                <p class="card-text">Valoración promedio: {{ number_format($libro->reviews_avg_valoracion, 1) }}/5</p>
                            @else
                                <p class="card-text">Sin valoraciones</p>
                            @endif
                            <a href="{{ route('libros.show', $libro->id) }}" class="btn btn-primary">Ver Detalles</a>
                            <a href="{{ route('libros.comentarios', $libro->id) }}" class="btn btn-info">Ver Comentarios</a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <p>No hay libros disponibles.</p>
    @endif
</div>
@endsection