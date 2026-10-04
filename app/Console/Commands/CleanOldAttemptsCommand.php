<?php

namespace App\Console\Commands;

use App\Models\AttemptAnswer;
use App\Services\FileUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanOldAttemptsCommand extends Command
{
    protected $signature = 'attempts:clean-old {days=30}';

    protected $description = 'Delete recorded audio older than the given number of days (default 30). Attempts, scores, transcripts and reviews are kept.';

    public function handle(FileUploadService $files): int
    {
        $days = max(1, (int) $this->argument('days'));
        $threshold = now()->subDays($days)->startOfDay();

        $this->info("Starting audio cleanup for answers older than {$days} days (before {$threshold->toDateTimeString()})...");

        $deletedAudios = 0;

        AttemptAnswer::query()
            ->whereNotNull('audio_path')
            ->where('created_at', '<', $threshold)
            ->chunkById(200, function ($answers) use ($files, &$deletedAudios) {
                foreach ($answers as $answer) {
                    $files->deleteFile($answer->audio_path);
                    // Query-builder update: no model events, only the audio reference is cleared.
                    AttemptAnswer::whereKey($answer->id)->update(['audio_path' => null]);
                    $deletedAudios++;
                }
            });

        // Orphaned files in the answers directory that no row references any more.
        $referenced = AttemptAnswer::whereNotNull('audio_path')
            ->pluck('audio_path')
            ->map(fn ($p) => basename($p))
            ->flip()
            ->all();

        $orphans = $this->deleteOldFiles(storage_path('app/public/attempt_answers_audio'), $threshold->timestamp, $referenced);

        // Temporary conversion files older than a day (current and legacy locations).
        $temp = $this->deleteOldFiles(storage_path('app/tmp'), now()->subDay()->timestamp)
            + $this->deleteOldFiles(storage_path('app/public/temp_audio'), now()->subDay()->timestamp);

        $message = "Audio cleanup finished: {$deletedAudios} audio files, {$orphans} orphaned files and {$temp} temp files deleted.";
        $this->info($message);
        Log::info($message);

        return Command::SUCCESS;
    }

    private function deleteOldFiles(string $dir, int $olderThan, array $keep = []): int
    {
        if (! is_dir($dir)) {
            return 0;
        }

        $count = 0;
        foreach (scandir($dir) as $file) {
            if ($file === '.' || $file === '..' || isset($keep[$file])) {
                continue;
            }

            $path = $dir.'/'.$file;
            if (is_file($path) && filemtime($path) < $olderThan && @unlink($path)) {
                $count++;
            }
        }

        return $count;
    }
}
