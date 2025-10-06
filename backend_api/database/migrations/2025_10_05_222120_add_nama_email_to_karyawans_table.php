<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            if (!Schema::hasColumn('karyawans', 'nama')) {
                $table->string('nama')->after('id');
            }

            if (!Schema::hasColumn('karyawans', 'email')) {
                $table->string('email')->unique()->after('nama');
            }
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            if (Schema::hasColumn('karyawans', 'nama')) {
                $table->dropColumn('nama');
            }

            if (Schema::hasColumn('karyawans', 'email')) {
                $table->dropColumn('email');
            }
        });
    }
};
