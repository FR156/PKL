<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Relasi ke accounts (user wajib punya account, tapi tetap ada kalau account dihapus)
            $table->foreignId('account_id')
                  ->nullable()
                  ->constrained('accounts')
                  ->onDelete('set null');

            // Data pribadi
            $table->string('name');                 // Nama lengkap
            $table->string('nik')->nullable()->unique(); // Nomor induk karyawan
            $table->string('phone')->nullable();
            $table->string('email')->nullable();    // Kalau berbeda dari akun login
            $table->text('address')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();

            // Foto profil termasuk dokumen resmi tapi gk di pisah ke tabel documents
            $table->string('profile_photo_path')->nullable();

            // Data pekerjaan
            $table->string('position')->nullable(); // Jabatan
            $table->string('division')->nullable();
            $table->date('hired_at')->nullable();   // Tanggal mulai kerja

            // Status kerja
            $table->enum('employment_status', [
                'active',
                'resigned',
                'terminated',
                'retired'
            ])->default('active');
            $table->date('resigned_at')->nullable();

            // Status umum
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
