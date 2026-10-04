<?php

namespace App\Observers;

use App\Jobs\CompressAudioJob;
use App\Jobs\EvaluateSpeakingJob;
use App\Models\AttemptAnswer;
use App\Services\FileUploadService;

class AttemptAnswerObserver
{
    /**
     * Handle the AttemptAnswer "saved" event.
     */
    public function saved(AttemptAnswer $attemptAnswer): void
    {
        // Dispatch if audio_path is newly provided (created) or changed (updated)
        if ($attemptAnswer->audio_path && ($attemptAnswer->wasRecentlyCreated || $attemptAnswer->wasChanged('audio_path'))) {
            if (! str_ends_with(strtolower($attemptAnswer->audio_path), '.mp3')) {
                // Dispatch compression job for uncompressed audio files
                CompressAudioJob::dispatch($attemptAnswer->id);
            } else {
                // Clear previous AI results to allow Job to run again and dispatch evaluation
                $attemptAnswer->score_ai = null;
                $attemptAnswer->transcript = null;
                $attemptAnswer->review_ai = null;
                $attemptAnswer->saveQuietly();

                EvaluateSpeakingJob::dispatch($attemptAnswer->id);
            }
        }
    }

    /**
     * Handle the AttemptAnswer "deleted" event.
     */
    public function deleting(AttemptAnswer $attemptAnswer): void
    {
        app(FileUploadService::class)->deleteFile($attemptAnswer->audio_path);
    }

    /**
     * Handle the AttemptAnswer "restored" event.
     */
    public function restored(AttemptAnswer $attemptAnswer): void
    {
        //
    }

    /**
     * Handle the AttemptAnswer "force deleted" event.
     */
    public function forceDeleted(AttemptAnswer $attemptAnswer): void
    {
        //
    }
}
