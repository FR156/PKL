<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts');
            $table->enum('type', ['clock_in', 'clock_out']);
            $table->dateTime('timestamp'); // waktu real dari frontend dulu, nanti baru server time timestamp()
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 10, 6);
            $table->string('photo_path');
            $table->boolean('is_late')->default(false);
            $table->boolean('is_early_leave')->default(false);
            $table->enum('status', ['approved', 'rejected', 'auto'])->default('approved');
            $table->boolean('irregular_clockout')->default(false);
            $table->foreignId('reviewed_by')->nullable()->constrained('accounts');
            $table->dateTime('reviewed_at')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
