<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1️⃣ Entities
        Schema::create('entities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 2️⃣ Fields
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            // $table->string('label')->nullable();
            // $table->string('data_type')->nullable();
            $table->timestamps();
        });

        // 3️⃣ Pivot: entity_has_fields (entity <-> field)
        Schema::create('attributes', function (Blueprint $table) {
            $table->unsignedBigInteger('entity_id');
            $table->unsignedBigInteger('field_id');

            // optional metadata
            // $table->boolean('is_required')->default(false);
            // $table->integer('display_order')->default(0);

            $table->primary(['entity_id', 'field_id']);

            $table->foreign('entity_id')
                  ->references('id')
                  ->on('entities')
                  ->onDelete('cascade');

            $table->foreign('field_id')
                  ->references('id')
                  ->on('fields')
                  ->onDelete('cascade');
        });

        // 4️⃣ Nested pivot: permission_has_attributes (permission <-> entity + field)
        Schema::create('permission_has_attributes', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('entity_id');
            $table->unsignedBigInteger('field_id');

            $table->enum('access_type', ['read', 'write', 'both'])->default('read');

            $table->primary(['permission_id', 'entity_id', 'field_id']);

            $table->foreign('permission_id')
                  ->references('id')
                  ->on('permissions')
                  ->onDelete('cascade');

            $table->foreign(['entity_id', 'field_id'])
                  ->references(['entity_id', 'field_id'])
                  ->on('attributes')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_has_attributes');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('fields');
        Schema::dropIfExists('entities');
    }
};
