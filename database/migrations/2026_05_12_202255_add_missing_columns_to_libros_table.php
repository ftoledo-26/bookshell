<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('libros', function (Blueprint $table) {
            if (!Schema::hasColumn('libros', 'editorial')) {
                $table->string('editorial')->nullable()->after('autor');
            }
            if (!Schema::hasColumn('libros', 'foto')) {
                $table->string('foto')->nullable()->after('descripcion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('libros', function (Blueprint $table) {
            if (Schema::hasColumn('libros', 'editorial')) {
                $table->dropColumn('editorial');
            }
            if (Schema::hasColumn('libros', 'foto')) {
                $table->dropColumn('foto');
            }
        });
    }
};
