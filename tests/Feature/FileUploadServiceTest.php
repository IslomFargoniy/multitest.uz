<?php

use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->fileUploadService = new FileUploadService;
    Storage::fake('public');
});

test('can upload audio file successfully', function () {
    $file = UploadedFile::fake()->create('test-audio.mp3', 100, 'audio/mpeg');

    $result = $this->fileUploadService->uploadAudio($file, 'test_dir/audio');

    expect($result)->toBeString()
        ->toContain('/storage/test_dir/audio/')
        ->toEndWith('.mp3')
        ->not->toContain('test-audio');

    $cleanPath = str_replace('/storage/', '', $result);
    Storage::disk('public')->assertExists($cleanPath);
});

test('can delete file successfully', function () {
    $file = UploadedFile::fake()->create('test-audio.mp3', 100, 'audio/mpeg');
    $path = $this->fileUploadService->uploadAudio($file, 'test_dir/audio');

    $cleanPath = str_replace('/storage/', '', $path);
    Storage::disk('public')->assertExists($cleanPath);

    $this->fileUploadService->deleteFile($path);

    Storage::disk('public')->assertMissing($cleanPath);
});

test('delete file does nothing when path is null', function () {
    // This should not throw any exceptions
    $this->fileUploadService->deleteFile(null);
    expect(true)->toBeTrue();
});

test('rejects non-audio files and never keeps client file name', function () {
    $this->fileUploadService->uploadAudio(UploadedFile::fake()->create('evil.php', 1, 'text/html'), 'test_dir/audio');
})->throws(\Illuminate\Validation\ValidationException::class);

test('stores audio with generated name and detected extension', function () {
    $path = $this->fileUploadService->uploadAudio(UploadedFile::fake()->create('a.html', 10, 'audio/webm'), 'x');

    expect($path)->toEndWith('.webm')->not->toContain('a.html');
});

test('image upload accepts jpg and rejects svg', function () {
    $ok = $this->fileUploadService->uploadImage(UploadedFile::fake()->image('a.jpg'), 'avatars');
    expect($ok)->toEndWith('.jpg');

    $this->fileUploadService->uploadImage(UploadedFile::fake()->create('a.svg', 1, 'image/svg+xml'), 'avatars');
})->throws(\Illuminate\Validation\ValidationException::class);
