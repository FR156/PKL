<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     */
    public function up(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            // Tambahkan kolom 'password' yang wajib ada untuk otentikasi
            $table->string('password')->after('email');

            // Tambahkan kolom 'remember_token'
            $table->rememberToken();
        });
    }

    /**
     * Batalkan migrasi (rollback).
     */
    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            // Hapus kolom 'password' dan 'remember_token' saat di-rollback
            $table->dropColumn('password');
            $table->dropRememberToken();
        });
    }
};
