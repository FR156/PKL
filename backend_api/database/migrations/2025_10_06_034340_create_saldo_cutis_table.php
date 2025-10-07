<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saldo_cutis', function (Blueprint $table) {
            $table->id('id_saldo_cuti');
            $table->unsignedBigInteger('id_karyawan');
            $table->unsignedBigInteger('id_jenis_cuti');
            $table->date('tahun');
            $table->integer('saldo')->default(0);
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_karyawan')->references('id')->on('karyawans')->onDelete('cascade');
            $table->foreign('id_jenis_cuti')->references('id_jenis_cuti')->on('jenis_cutis')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saldo_cutis');
    }
};
