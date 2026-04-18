<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();
            $table->string('titulo')->nullable();
            $table->string('autor')->nullable();
            $table->string('editorial')->nullable();
            $table->string('anio_publicacion')->nullable();
                $table->enum('genero', [
                                        'novela',
                                        'fantasia',
                                        'ciencia_ficcion',
                                        'terror',
                                        'misterio',
                                        'romance',
                                        'historia',
                                        'biografia',
                                        'poesia',
                                        'ensayo',
                                        'otro', 
                                        ])->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};
