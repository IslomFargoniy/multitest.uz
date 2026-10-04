<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Earlier the grading job forced score_ai to 0 (silence, wrong language, off-topic) but kept the model's
 * own score/level inside review_ai, so the analysis card showed e.g. "A2 · 10 / 75" next to "AI Score: 0".
 * Align the stored analysis with the final score.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('attempt_answers')
            ->where('score_ai', 0)
            ->whereNotNull('review_ai')
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    $data = json_decode($row->review_ai, true);
                    if (! is_array($data) || ! isset($data['score']) || (int) $data['score'] === 0) {
                        continue;
                    }

                    $data['score'] = 0;
                    $data['level'] = 'Below A1';
                    $data['override_reason'] = $data['override_reason'] ?? 'post_check';

                    DB::table('attempt_answers')->where('id', $row->id)->update([
                        'review_ai' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);
                }
            });
    }

    public function down(): void
    {
        //
    }
};
