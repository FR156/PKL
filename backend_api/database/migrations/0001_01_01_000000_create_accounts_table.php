<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 🔹 TABLE: accounts
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();

            // Identitas dasar akun
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // 🔹 Kolom tambahan yang disarankan untuk HRMS
            $table->boolean('is_active')->default(true); // status login aktif/nonaktif
            $table->softDeletes(); // kalau kamu mau bisa nonaktifkan akun tanpa hapus data

            $table->rememberToken();
            $table->timestamps();
        });

        /*// 🔹 TABLE: password_reset_tokens
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 🔹 TABLE: sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('account_id')->nullable()->index()
                  ->constrained('accounts')
                  ->onDelete('cascade'); // biar sesi otomatis hilang kalau akun dihapus
            $table->string('ip_address', 45)->nullable();

            // perbaikan: typo 'account_agent' → 'user_agent'
            $table->text('user_agent')->nullable();

            $table->longText('payload');
            $table->integer('last_activity')->index();
        });*/
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
        // Schema::dropIfExists('password_reset_tokens');
        // Schema::dropIfExists('sessions');
    }
};
