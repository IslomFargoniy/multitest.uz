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
use Telegram\Bot\Api;

use Telegram\Bot\FileUpload\InputFile;

class EvaluateSpeakingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $answerId;

    public function __construct($answerId)
    {
        $this->answerId = $answerId;
    }

    public function handle(GeminiAiService $gemini, NotificationService $notifications)
    {
        $answer = AttemptAnswer::find($this->answerId);
        if (!$answer || !$answer->audio_path) return;

        // Note: score_ai check removed to allow re-evaluation triggered from controller

        try {
            // Evaluated ONLY with Gemini as requested by user
            $resultText = $gemini->evaluateSpeakingDirectly($answer->audio_path, $answer->question);
            Log::info("AI Evaluation #{$answer->id}: Gemini successful.");

            // 3. Parse Result
            $data = json_decode($resultText, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                $transcript = $data['transcript'] ?? '';
                $answer->transcript = $transcript;
                $answer->review_ai = $resultText;
                $answer->score_ai = (int) ($data['score'] ?? 0);

                // Language & Relevance Checks
                $targetLanguage = strtolower($answer->question->part->test->language->name_en);
                $detectedLanguage = strtolower($data['detected_language'] ?? '');

                if ($detectedLanguage !== 'noise' && $detectedLanguage !== 'silence' && !empty($detectedLanguage)) {
                    if (!str_contains($detectedLanguage, $targetLanguage) && !str_contains($targetLanguage, $detectedLanguage)) {
                        $answer->score_ai = 0;
                    }
                }

                if (($data['is_relevant'] ?? true) === false) {
                    $answer->score_ai = 0;
                }

                if ($this->isNonSpeechResponse($transcript) || $detectedLanguage === 'noise' || $detectedLanguage === 'silence') {
                    $answer->score_ai = 0;
                }
            } else {
                // Regex fallback if JSON is messy
                if (preg_match('/"score"\s*:\s*(\d+)/', $resultText, $matches)) {
                    $answer->score_ai = (int) $matches[1];
                }
                $answer->review_ai = $resultText;
            }

            $answer->save();

            // 4. Notifications
            $notifications->sendPerQuestionTelegram($answer);
            $this->checkAndNotifyIfComplete($answer, $notifications);

        } catch (\Throwable $e) {
            Log::error("AI Evaluation #{$answer->id} fatal failure: " . $e->getMessage());
            $answer->review_ai = 'AI Error: ' . $e->getMessage();
            $answer->save();
        }
    }

    protected function checkAndNotifyIfComplete(AttemptAnswer $answer, NotificationService $notifications): void
    {
        try {
            $attemptPart = $answer->attempt_part;
            if (!$attemptPart) return;

            $attempt = $attemptPart->attempt;
            if (!$attempt) return;

            $totalAudioAnswers = AttemptAnswer::whereHas('attempt_part', function ($q) use ($attempt) {
                $q->where('attempt_id', $attempt->id);
            })->whereNotNull('audio_path')->count();

            $unevaluatedAnswers = AttemptAnswer::whereHas('attempt_part', function ($q) use ($attempt) {
                $q->where('attempt_id', $attempt->id);
            })->whereNotNull('audio_path')->whereNull('score_ai')->count();

            if ($totalAudioAnswers === 0 || $unevaluatedAnswers > 0) return;

            $lockKey = "attempt_notification_{$attempt->id}";
            $lock = Cache::lock($lockKey, 60);

            if ($lock->get()) {
                $user = $attempt->user;
                if (!$user) {
                    $lock->release();
                    return;
                }

                if (!$user->telegram_id && $user->email) {
                    $notifications->sendFinalResultEmail($user, $attempt);
                }
            }
        } catch (\Throwable $e) {
            Log::error("checkAndNotifyIfComplete failed: " . $e->getMessage());
        }
    }


    public function isMostlyEnglish(string $text): bool
    {
        // 1. Reject if contains Cyrillic or specialized Uzbek Krill letters
        if (preg_match('/[А-Яа-яЎўҚқҒғҲҳ]/u', $text)) {
            return false;
        }

        // 2. Reject if contains Turkish/Azeri special characters (ğ, ü, ş, ı, ö, ç)
        if (preg_match('/[ğüşıöçĞÜŞİÖÇ]/u', $text)) {
            return false;
        }

        // 3. Must contain English letters or numbers/symbols typical of noise/silence (which we handled above)
        return preg_match('/[a-zA-Z]/', $text) === 1;
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
        if (!preg_match('/[a-z0-9]/i', $text)) {
            return true;
        }

        // Extremely short transcripts (1-2 characters) that aren't letters are likely noise
        if (strlen($text) < 3 && !preg_match('/[a-z]/i', $text)) {
            return true;
        }

        return false;
    }

    /**
     * Get the physical path of the audio file.
     */
    protected function getAudioPhysicalPath(?string $path): ?string
    {
        if (!$path) return null;
        $cleanPath = str_replace(['/storage/', 'storage/'], '', $path);
        return storage_path('app/public/' . ltrim($cleanPath, '/'));
    }



}
