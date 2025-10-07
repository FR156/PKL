<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_cutis', function (Blueprint $table) {
            $table->id('id_pengajuan_cuti');
            $table->unsignedBigInteger('id_jenis_cuti');
            $table->unsignedBigInteger('id_karyawan');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('alasan')->nullable();
            $table->string('status')->default('menunggu');
            $table->timestamps();

            // foreign keys
            $table->foreign('id_jenis_cuti')
                  ->references('id_jenis_cuti')
                  ->on('jenis_cutis')
                  ->onDelete('cascade');

            $table->foreign('id_karyawan')
                  ->references('id')
                  ->on('karyawans')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_cutis');
    }
};
