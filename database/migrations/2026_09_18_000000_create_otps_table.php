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
        if (!Schema::hasTable('otps')) {
            Schema::create('otps', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('code', 10)->index();
                $table->timestamp('expired_at');
                $table->boolean('expired')->default(false);
                $table->boolean('is_android')->default(false);
                $table->boolean('is_ios')->default(false);
                $table->boolean('is_mobile')->default(true);
                $table->boolean('is_email')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otps');
    }
};
