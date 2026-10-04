<?php

namespace App\Observers;

use App\Models\Question;
use App\Support\HtmlSanitizer;
use DOMDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QuestionObserver
{
    public function saving(Question $question): void
    {
        if ($question->isDirty('textarea')) {
            $oldHtml = $question->getOriginal('textarea') ?? '';

            // 1. Process the content (Saves new Base64, leaves existing URLs alone)
            $newHtml = HtmlSanitizer::clean($this->processImages($question->textarea));

            // 2. Cleanup (If updating, check what was removed)
            if ($question->exists) {
                $this->deleteOrphanedImages($oldHtml, $newHtml, $question->id);
            }

            // 3. Update the model attribute with the clean HTML
            $question->textarea = $newHtml;
        }
    }

    public function forceDeleted(Question $question): void
    {
        $this->deleteOrphanedImages($question->textarea, '', $question->id);
    }

    private function processImages(?string $content): string
    {
        if (empty($content)) {
            return '';
        }

        $dom = new DOMDocument;
        // Load with UTF-8 support
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $images = $dom->getElementsByTagName('img');

        foreach ($images as $img) {
            $src = $img->getAttribute('src');

            // SCENARIO: User pasted/uploaded a NEW image (Base64)
            if (preg_match('/^data:image\/(\w+);base64,/', $src, $type)) {
                $extension = strtolower($type[1]) === 'jpeg' ? 'jpg' : strtolower($type[1]);
                $data = base64_decode(substr($src, strpos($src, ',') + 1), true);
                $info = $data === false || strlen($data) > 5 * 1024 * 1024 ? false : @getimagesizefromstring($data);
                $mimeToExt = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp'];

                if ($info === false || ! isset($mimeToExt[$info['mime']])) {
                    $img->parentNode?->removeChild($img);

                    continue;
                }

                $extension = $mimeToExt[$info['mime']];
                $fileName = 'question_images/'.Str::random(20).'.'.$extension;

                Storage::disk('public')->put($fileName, $data);
                $img->setAttribute('src', Storage::url($fileName));
            }
            // SCENARIO: Image is already a URL (Previously saved)
            // We do nothing, DOMDocument will preserve the existing src attribute.
        }

        return $dom->saveHTML();
    }

    private function deleteOrphanedImages(string $oldHtml, string $newHtml, $currentId): void
    {
        $oldImages = $this->extractStoragePaths($oldHtml);
        $newImages = $this->extractStoragePaths($newHtml);

        // Files present in old version but missing in new version
        $imagesToDelete = array_diff($oldImages, $newImages);

        foreach ($imagesToDelete as $path) {
            if (! empty($path) && ! $this->isImageUsedByOthers($path, $currentId)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    private function isImageUsedByOthers(string $path, $currentId): bool
    {
        return DB::table('questions')
            ->where('id', '!=', $currentId)
            ->where('textarea', 'LIKE', '%'.$path.'%')
            ->exists();
    }

    private function extractStoragePaths(string $content): array
    {
        if (empty($content)) {
            return [];
        }
        // Extract the path relative to the public disk (question_images/filename.ext)
        preg_match_all('/question_images\/([^\s"\'\>]+)/', $content, $matches);

        return array_unique($matches[0] ?? []);
    }
}
