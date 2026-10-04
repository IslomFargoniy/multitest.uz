<?php

namespace App\Services;

use App\Support\AudioUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FileUploadService
{
    private const IMAGE_MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Upload an audio file. The stored name and extension are generated server-side
     * from the detected MIME type; the client-supplied name is never used.
     *
     * @return string The public path to the uploaded file.
     */
    public function uploadAudio(UploadedFile $file, string $directory): string
    {
        $extension = AudioUpload::extensionFor($file->getMimeType());

        if (! $extension) {
            throw ValidationException::withMessages(['audio' => ['Unsupported audio format.']]);
        }

        $filePath = $file->storeAs($directory, Str::uuid().'.'.$extension, 'public');

        return '/storage/'.$filePath;
    }

    /**
     * Upload an image (avatar etc.). Only jpg/png/webp, generated file name.
     */
    public function uploadImage(UploadedFile $file, string $directory): string
    {
        $extension = self::IMAGE_MIME_EXTENSIONS[strtolower((string) $file->getMimeType())] ?? null;

        if (! $extension) {
            throw ValidationException::withMessages(['image' => ['Unsupported image format.']]);
        }

        $filePath = $file->storeAs($directory, Str::uuid().'.'.$extension, 'public');

        return '/storage/'.$filePath;
    }

    /**
     * Delete a locally stored file if it exists. External URLs are ignored.
     */
    public function deleteFile(?string $path): void
    {
        if (! $path || str_starts_with($path, 'http')) {
            return;
        }

        $cleanPath = ltrim(preg_replace('#^/?storage/#', '', $path), '/');

        if ($cleanPath !== '' && ! str_contains($cleanPath, '..') && Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
    }
}
