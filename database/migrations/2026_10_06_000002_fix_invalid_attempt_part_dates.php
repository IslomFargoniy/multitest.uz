<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Before MySQL strict mode was enabled, attempt parts created through the mobile API were stored
 * without started_at (zero date). Back-fill them from created_at. Take a DB backup before migrating.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("UPDATE attempt_parts SET started_at = COALESCE(created_at, NOW()) WHERE started_at IS NULL OR CAST(started_at AS CHAR) LIKE '0000-00-00%'");
    }

    public function down(): void
    {
        //
    }
};
