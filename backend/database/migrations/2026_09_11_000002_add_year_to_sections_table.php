<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique(['program', 'section']);
            $table->unsignedTinyInteger('year')
                ->default(1)
                ->after('program');
            $table->unique(['program', 'year', 'section']);
        });
    }

    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique(['program', 'year', 'section']);
            $table->dropColumn('year');
            $table->unique(['program', 'section']);
        });
    }
};