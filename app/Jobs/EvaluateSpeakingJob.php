<?php

namespace App\Jobs;

use App\Models\AttemptAnswer;
use App\Services\GeminiAiService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EvaluateSpeakingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** A Gemini call with audio can take a while; the worker default (60s) would kill and re-run it. */
    public $timeout = 180;

    public $tries = 3;

    public $backoff = [30, 120];

    protected $answerId;

    public function __construct($answerId)
    {
        $this->answerId = $answerId;
    }

    public function handle(GeminiAiService $gemini, NotificationService $notifications)
    {
        $answer = AttemptAnswer::find($this->answerId);
        if (! $answer || ! $answer->audio_path) {
            return;
        }

        $question = $answer->question;
        if (! $question) {
            Log::warning("AI Evaluation #{$answer->id}: question no longer exists, skipping.");

            return;
        }

        // Errors propagate on purpose so the queue retries transient API failures; failed() records the final one.
        $resultText = $gemini->evaluateSpeakingDirectly($answer->audio_path, $question);
        Log::info("AI Evaluation #{$answer->id}: Gemini successful.");

        $data = json_decode($resultText, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
            $transcript = (string) ($data['transcript'] ?? '');
            $answer->transcript = $transcript;
            $answer->score_ai = max(0, min(75, (int) ($data['score'] ?? 0)));
            $zeroReason = null;

            // Language & Relevance Checks
            $targetLanguage = strtolower((string) ($question->part?->test?->language?->name_en ?? ''));
            $detectedLanguage = strtolower((string) ($data['detected_language'] ?? ''));

            if ($targetLanguage !== '' && $detectedLanguage !== 'noise' && $detectedLanguage !== 'silence' && $detectedLanguage !== '') {
                if (! str_contains($detectedLanguage, $targetLanguage) && ! str_contains($targetLanguage, $detectedLanguage)) {
                    $zeroReason = 'wrong_language';
                }
            }

            if (($data['is_relevant'] ?? true) === false) {
                $zeroReason = 'not_relevant';
            }

            if ($this->isNonSpeechResponse($transcript) || $detectedLanguage === 'noise' || $detectedLanguage === 'silence') {
                $zeroReason = 'no_speech';
            }

            if ($zeroReason !== null) {
                $answer->score_ai = 0;
            }

            // Store the analysis with the final score so every client (web, Android, certificates) shows the same number.
            $data['score'] = $answer->score_ai;
            if ($zeroReason !== null) {
                $data['level'] = 'Below A1';
                $data['override_reason'] = $zeroReason;
            }
            $answer->review_ai = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            // Regex fallback if JSON is messy
            if (preg_match('/"score"\s*:\s*(\d+)/', $resultText, $matches)) {
                $answer->score_ai = (int) $matches[1];
            }
            $answer->review_ai = $resultText;
        }

        if ($answer->score_ai !== null) {
            $answer->score_ai = max(0, min(75, (int) $answer->score_ai));
        }

        $answer->save();

        $notifications->sendPerQuestionTelegram($answer);
        $this->checkAndNotifyIfComplete($answer, $notifications);
    }

    public function failed(\Throwable $e): void
    {
        Log::error("AI Evaluation #{$this->answerId} failed permanently: ".$e->getMessage());

        AttemptAnswer::whereKey($this->answerId)->update([
            'review_ai' => 'AI Error: '.$e->getMessage(),
        ]);
    }

    protected function checkAndNotifyIfComplete(AttemptAnswer $answer, NotificationService $notifications): void
    {
        try {
            $attemptPart = $answer->attempt_part;
            if (! $attemptPart) {
                return;
            }

            $attempt = $attemptPart->attempt;
            if (! $attempt) {
                return;
            }

            $totalAudioAnswers = AttemptAnswer::whereHas('attempt_part', function ($q) use ($attempt) {
                $q->where('attempt_id', $attempt->id);
            })->whereNotNull('audio_path')->count();

            $unevaluatedAnswers = AttemptAnswer::whereHas('attempt_part', function ($q) use ($attempt) {
                $q->where('attempt_id', $attempt->id);
            })->whereNotNull('audio_path')->whereNull('score_ai')->count();

            if ($totalAudioAnswers === 0 || $unevaluatedAnswers > 0) {
                return;
            }

            $lockKey = "attempt_notification_{$attempt->id}";
            $lock = Cache::lock($lockKey, 60);

            if ($lock->get()) {
                $user = $attempt->user;
                if (! $user) {
                    $lock->release();

                    return;
                }

                if (! $user->telegram_id && $user->email) {
                    $notifications->sendFinalResultEmail($user, $attempt);
                }
            }
        } catch (\Throwable $e) {
            Log::error('checkAndNotifyIfComplete failed: '.$e->getMessage());
        }
    }

    /**
     * Detect if the transcript indicates a non-speech response.
     */
    public function isNonSpeechResponse(string $text): bool
    {
        $text = strtolower(trim($text));

        $nonSpeechPatterns = [
            '/\bsilence\b/i',
            '/\bbackground noise\b/i',
            '/\bno discernible speech\b/i',
            '/\bno speech\b/i',
            '/\bcontains no speech\b/i',
            '/\bnot possible to transcribe\b/i',
            '/\bupbeat music\b/i',
            '/\bstrong beat\b/i',
            '/\[SILENCE\]/i',
            '/\[NOISE\]/i',
            '/^\(.*\)$/', // Transcriptions in parentheses like (Silence)
            '/^[0-9: ]+$/', // Just timestamps or numbers
        ];

        foreach ($nonSpeechPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        // If the string contains NO letters or numbers (only symbols/punctuation), it's noise
        if (! preg_match('/[a-z0-9]/i', $text)) {
            return true;
        }

        // Extremely short transcripts (1-2 characters) that aren't letters are likely noise
        if (strlen($text) < 3 && ! preg_match('/[a-z]/i', $text)) {
            return true;
        }

        return false;
    }
}
