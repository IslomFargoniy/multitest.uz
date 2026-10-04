<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->string('verify_code', 32)->nullable()->unique()->after('review');
        });

        DB::table('attempts')->whereNull('verify_code')->orderBy('id')->chunkById(500, function ($rows) {
            foreach ($rows as $row) {
                DB::table('attempts')->where('id', $row->id)->update(['verify_code' => Str::lower(Str::random(32))]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropUnique(['verify_code']);
            $table->dropColumn('verify_code');
        });
    }
};
