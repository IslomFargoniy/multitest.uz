<?php

namespace App\Services;

use App\Models\AttemptAnswer;
use App\Models\User\User;
use App\Jobs\SendResultEmailJob;
use Telegram\Bot\Api;
use Telegram\Bot\FileUpload\InputFile;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send per-question Telegram notification.
     */
    public function sendPerQuestionTelegram(AttemptAnswer $answer): void
    {
        try {
            $attemptPart = $answer->attempt_part;
            if (!$attemptPart) return;

            $attempt = $attemptPart->attempt;
            if (!$attempt) return;

            $user = $attempt->user;
            if (!$user || !$user->telegram_id) return;

            $question = $answer->question;
            if (!$question) return;

            $telegram = new Api(config('services.telegram.bot_token'));
            $chatId = $user->telegram_id;

            $questionText = $this->extractText($question->textarea ?? '');
            $imageUrls = $this->extractImageUrls($question->textarea ?? '');
            $scoreAi = $answer->score_ai ?? 0;

            $audioPath = $this->getAudioPhysicalPath($answer->audio_path);
            $hasAudio = $audioPath && file_exists($audioPath);

            $userName = htmlspecialchars($user->name ?? 'Foydalanuvchi', ENT_QUOTES, 'UTF-8');
            $qText = htmlspecialchars($questionText, ENT_QUOTES, 'UTF-8');

            $caption = "🎉 <b>Natijangiz tayyor!</b>\n\n"
                . "👤 {$userName}\n"
                . "📝 <b>Savol :</b> {$qText}\n"
                . "📊 <b>AI bahosi:</b> {$scoreAi}\n\n"
                . "💳 <b>Bizni Qo'llab-quvvatlang:</b>\n\n"
                . "<code>9860600402432220</code>\n\n"
                . "Donat qilishingiz mumkin.";

            // 1. Send Images if any
            if (count($imageUrls) > 0) {
                try {
                    if (count($imageUrls) > 1) {
                        $media = [];
                        $attachments = [];
                        foreach ($imageUrls as $index => $imgData) {
                            $attachmentName = "photo{$index}";
                            if ($imgData['type'] === 'local') {
                                $attachments[$attachmentName] = InputFile::create($imgData['path'], basename($imgData['path']));
                                $mediaId = "attach://{$attachmentName}";
                            } else {
                                $mediaId = $imgData['path'];
                            }
                            $media[] = [
                                'type' => 'photo',
                                'media' => $mediaId,
                                'parse_mode' => 'HTML',
                            ];
                        }
                        $params = ['chat_id' => $chatId, 'media' => json_encode($media)];
                        foreach ($attachments as $key => $file) {
                            $params[$key] = $file;
                        }
                        $telegram->sendMediaGroup($params);
                    } else {
                        $imgData = $imageUrls[0];
                        $photo = $imgData['type'] === 'local' 
                            ? InputFile::create($imgData['path'], basename($imgData['path'])) 
                            : $imgData['path'];

                        $telegram->sendPhoto([
                            'chat_id' => $chatId,
                            'photo' => $photo,
                            'parse_mode' => 'HTML',
                        ]);
                    }
                } catch (\Exception $imgErr) {
                    Log::error("Image sending failed for Answer #{$answer->id}: " . $imgErr->getMessage());
                }
            }

            // 2. Send Audio with Caption (Main message)
            if ($hasAudio) {
                try {
                    $telegram->sendVoice([
                        'chat_id' => $chatId,
                        'voice' => InputFile::create($audioPath, 'answer.ogg'),
                        'caption' => $caption,
                        'parse_mode' => 'HTML',
                    ]);
                    return;
                } catch (\Exception $audErr) {
                    Log::error("Audio send failed for Answer #{$answer->id}: " . $audErr->getMessage());
                }
            }

            // 3. Fallback (text only)
            $telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => $caption,
                'parse_mode' => 'HTML',
            ]);

        } catch (\Throwable $e) {
            Log::error("sendPerQuestionTelegram fatal failure for Answer #{$answer->id}: " . $e->getMessage());
        }
    }

    /**
     * Send final result email notification.
     */
    public function sendFinalResultEmail(User $user, $attempt): void
    {
        SendResultEmailJob::dispatch($user, $attempt)->delay(now()->addSeconds(5));
    }

    protected function extractText(string $html): string
    {
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = trim(preg_replace('/\s+/', ' ', $text));
        if (mb_strlen($text) > 200) {
            $text = mb_substr($text, 0, 200) . '...';
        }
        return $text ?: '—';
    }

    protected function extractImageUrls(string $html): array
    {
        $images = [];
        if (preg_match_all('/<img[^>]+src=["\']([^"\']+)["\']/i', $html, $matches)) {
            foreach ($matches[1] as $src) {
                if (str_starts_with($src, '/storage/')) {
                    $path = storage_path('app/public/' . substr($src, 9));
                    if (file_exists($path)) {
                        $images[] = ['type' => 'local', 'path' => $path];
                    }
                } elseif (str_starts_with($src, config('app.url') . '/storage/')) {
                    $path = storage_path('app/public/' . substr(parse_url($src, PHP_URL_PATH), 9));
                    if (file_exists($path)) {
                        $images[] = ['type' => 'local', 'path' => $path];
                    }
                } elseif (str_starts_with($src, 'http')) {
                    $images[] = ['type' => 'url', 'path' => $src];
                }
            }
        }
        return $images;
    }

    protected function getAudioPhysicalPath(?string $path): ?string
    {
        if (!$path) return null;
        $cleanPath = str_replace(['/storage/', 'storage/'], '', $path);
        return storage_path('app/public/' . ltrim($cleanPath, '/'));
    }
}
