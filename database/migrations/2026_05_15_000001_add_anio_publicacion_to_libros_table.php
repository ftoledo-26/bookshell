<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('libros', function (Blueprint $table) {
            if (!Schema::hasColumn('libros', 'anio_publicacion')) {
                $table->string('anio_publicacion')->nullable()->after('editorial');
            }
        });
    }

    public function down(): void
    {
        Schema::table('libros', function (Blueprint $table) {
            if (Schema::hasColumn('libros', 'anio_publicacion')) {
                $table->dropColumn('anio_publicacion');
            }
        });
    }
};
