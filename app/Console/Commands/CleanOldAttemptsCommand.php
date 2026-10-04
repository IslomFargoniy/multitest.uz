<?php

namespace App\Console\Commands;

use App\Models\Attempt;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanOldAttemptsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attempts:clean-old {days=30}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean audio files and attempt records older than specified number of days (default: 30 days)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->argument('days');
        $dateThreshold = now()->subDays($days)->startOfDay();

        $this->info("Starting cleanup for attempts older than {$days} days (before {$dateThreshold->toDateTimeString()})...");

        $totalDeletedAudios = 0;
        $totalDeletedAttempts = 0;

        Attempt::withTrashed()
            ->where('created_at', '<', $dateThreshold)
            ->with(['attempt_parts.attempt_answers'])
            ->chunkById(100, function ($attempts) use (&$totalDeletedAudios, &$totalDeletedAttempts) {
                foreach ($attempts as $attempt) {
                    foreach ($attempt->attempt_parts as $part) {
                        foreach ($part->attempt_answers as $answer) {
                            if (!empty($answer->audio_path)) {
                                $cleanPath = str_replace(['/storage/', 'storage/'], '', $answer->audio_path);
                                if (Storage::disk('public')->exists($cleanPath)) {
                                    Storage::disk('public')->delete($cleanPath);
                                    $totalDeletedAudios++;
                                }
                            }
                            $answer->forceDelete();
                        }
                        $part->forceDelete();
                    }
                    $attempt->forceDelete();
                    $totalDeletedAttempts++;
                }
            });

        // 2. Also cleanup orphaned audio files older than threshold that have no DB reference
        $activeFiles = \App\Models\AttemptAnswer::whereNotNull('audio_path')
            ->pluck('audio_path')
            ->map(fn($p) => basename($p))
            ->flip()
            ->toArray();

        $dir = storage_path('app/public/attempt_answers_audio');
        $totalDeletedOrphans = 0;

        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                if (isset($activeFiles[$file])) continue;
                $fullPath = $dir . '/' . $file;
                if (is_file($fullPath) && filemtime($fullPath) < $dateThreshold->timestamp) {
                    if (@unlink($fullPath)) {
                        $totalDeletedOrphans++;
                    }
                }
            }
        }

        $message = "Audio cleanup finished: {$totalDeletedAttempts} attempts, {$totalDeletedAudios} audio files, and {$totalDeletedOrphans} orphaned files deleted.";
        $this->info($message);
        Log::info($message);

        return Command::SUCCESS;
    }
}
