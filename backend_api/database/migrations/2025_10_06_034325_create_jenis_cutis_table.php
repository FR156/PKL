<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jenis_cutis', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id_jenis_cuti'); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('nama_cuti', 20);
            $table->enum('is_paid', ['YES', 'NO'])->default('YES');
            $table->integer('durasi_default')->default(0);
            $table->enum('reset_policy', ['yearly', 'monthly', 'none', 'quarterly'])->default('yearly');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_cutis');
    }
};
