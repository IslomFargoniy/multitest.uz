<?php

namespace App\Support;

/**
 * Built-in examiner audio shipped in public/{lang}/audio. Falls back to English when a language has no recordings.
 */
class DefaultAudio
{
    public static function path(?string $languageCode, string $file): string
    {
        $code = strtolower((string) $languageCode);

        if ($code !== '' && preg_match('/^[a-z]{2,5}$/', $code) && is_file(public_path("{$code}/audio/{$file}"))) {
            return "/{$code}/audio/{$file}";
        }

        return "/en/audio/{$file}";
    }
}
