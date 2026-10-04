<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * mocks.started_at is the canonical start time. Copy the legacy starts_at where it is missing
 * (the column itself is kept for now and no longer read or written by the application).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('mocks')->whereNull('started_at')->whereNotNull('starts_at')->update(['started_at' => DB::raw('starts_at')]);
    }

    public function down(): void
    {
        //
    }
};
