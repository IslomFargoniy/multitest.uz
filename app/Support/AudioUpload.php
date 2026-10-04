<?php

namespace App\Support;

/**
 * Single source of truth for accepted audio uploads (web, API and admin forms).
 */
class AudioUpload
{
    /** MIME type => stored extension */
    public const MIME_EXTENSIONS = [
        'audio/mpeg' => 'mp3',
        'audio/mp3' => 'mp3',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav',
        'audio/wave' => 'wav',
        'audio/webm' => 'webm',
        'video/webm' => 'webm',
        'audio/ogg' => 'ogg',
        'application/ogg' => 'ogg',
        'audio/mp4' => 'm4a',
        'audio/x-m4a' => 'm4a',
        'audio/m4a' => 'm4a',
        'audio/aac' => 'aac',
        'video/mp4' => 'm4a',
    ];

    /** Max size for a single recorded answer, in kilobytes. */
    public const MAX_ANSWER_KB = 20480;

    /** Max size for audio uploaded by teachers (test/part/question prompts), in kilobytes. */
    public const MAX_PROMPT_KB = 20480;

    public static function mimeRule(): string
    {
        return 'mimetypes:'.implode(',', array_keys(self::MIME_EXTENSIONS));
    }

    public static function rules(int $maxKb = self::MAX_ANSWER_KB): array
    {
        return ['nullable', 'file', 'max:'.$maxKb, self::mimeRule()];
    }

    public static function extensionFor(?string $mime): ?string
    {
        return $mime ? (self::MIME_EXTENSIONS[strtolower($mime)] ?? null) : null;
    }
}
