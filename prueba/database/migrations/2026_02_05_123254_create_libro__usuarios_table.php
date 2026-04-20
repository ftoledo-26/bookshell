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
        Schema::create('libro__usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained()->onDelete('cascade');
            $table->foreignId('libro_id')->constrained()->onDelete('cascade');
            $table->string('estado')->nullable(); // 'favorito', 'leido', 'leyendo'
            $table->timestamps();
        });   
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('libro__usuarios');
    }
};
