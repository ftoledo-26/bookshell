<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('rol')->default('usuario');
            $table->string('foto')->default('default.png');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
