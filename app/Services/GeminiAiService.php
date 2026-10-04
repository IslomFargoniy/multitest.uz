<?php

namespace App\Services;

use Gemini;
use Gemini\Data\Blob;
use Gemini\Data\GenerationConfig;
use Gemini\Data\Schema;
use Gemini\Enums\DataType;
use Gemini\Enums\MimeType;
use Gemini\Enums\ResponseMimeType;
use Illuminate\Support\Facades\Log;

class GeminiAiService
{
    protected $client;

    protected string $model;

    public function __construct()
    {
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash-lite');
        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            Log::error('GEMINI_API_KEY is not set in .env file');
        }
        $this->client = Gemini::client($apiKey ?? '');
    }

    public function evaluateSpeakingDirectly(string $audioPath, object $question): string
    {
        try {
            $fullPath = $this->getPhysicalPath($audioPath);
            if (! file_exists($fullPath)) {
                throw new \Exception("Audio file not found at path: {$fullPath}");
            }

            $language = $question->part?->test?->language;
            $languageCode = $language?->code ?? 'en';
            $languageName = $language?->name_en ?? 'English';

            $instruction = "
You are an expert Uzbekistan Multilevel (CEFR) Speaking Examiner.
Your task is to evaluate the provided audio response based on official scientific CEFR descriptors.

TARGET LANGUAGE:
- Language code: {$languageCode}
- Language name (English): {$languageName}

SCORING CRITERIA (Total: 0–75 points, 15 points each):
1. Fluency and Coherence (0–15): Speech flow, hesitations, linking of ideas.
2. Lexical Resource (0–15): Range and accuracy of vocabulary.
3. Grammatical Range & Accuracy (0–15): Variety and correctness of structures.
4. Pronunciation (0–15): Intelligibility, stress, and intonation.
5. Interactive Communication / Relevance (0–15): Directly answering the question and maintaining interaction.

CEFR LEVEL DESCRIPTORS FOR REFERENCE:
- C1 (65–75): Fluent, spontaneous, complex subjects, almost no searching for words.
- B2 (51–64): Regular interaction with native speakers possible without strain. Clear, detailed descriptions on wide range of subjects.
- B1 (38–50): Can deal with most situations. Narrate dreams, hopes, ambitions. Simple connected phrases.
- A2 (16–37): Simple and routine tasks. Direct exchange of information on familiar topics.
- A1 (0–15): Basic expressions, very simple phrases about personal details.

CRITICAL RULES:

⚠️ RELEVANCE CHECK (HIGHEST PRIORITY):
- You MUST compare the student's spoken answer against the SPECIFIC QUESTION below.
- Set `is_relevant` to `true` ONLY if the student's response DIRECTLY addresses, discusses, or attempts to answer the question.
- Set `is_relevant` to `false` if:
  • The student talks about a completely different topic than the question asks.
  • The student reads or recites something unrelated.
  • The student answers a DIFFERENT question (e.g., question asks about \"social media\" but student talks about \"pictures\").
  • The student repeats the question itself without giving an actual answer.
- If `is_relevant` is `false`: You MUST set `score` to 0 and `level` to \"Below A1\".

- STRICT LANGUAGE ENFORCEMENT: You MUST verify if the spoken language matches the TARGET LANGUAGE ({$languageName}). 
- IF THE CANDIDATE SPEAKS IN ANY OTHER LANGUAGE: You MUST assign a total `score` of 0, set `level` to \"Below A1\", and explicitly state \"Wrong language detected\" in the feedback fields. DO NOT give any partial credit.
- AUDIO QUALITY & SILENCE: If the audio is silent, contains only background noise, static, breathing, or unintelligible sounds, you MUST set the `transcript` to \"[SILENCE]\", assign a total `score` of 0, and set `level` to \"Below A1\". 
- NO HALLUCINATION: Do NOT guess, invent, or hallucinate speech if it is not clearly and distinctly audible. If there is any doubt about the existence of speech, treat the audio as noise. 
- ALWAYS provide a verbatim `transcript`. If no speech, use \"[SILENCE]\".
- IDENTIFY LANGUAGE: You must identify the `detected_language` in the response (e.g., \"English\", \"Turkish\", \"Uzbek\", \"Noise\").

QUESTION:
{$question->textarea}
";
            $audioInfo = $this->getCompatibleAudio($fullPath);
            $mimeType = $audioInfo['mimeType'];
            $tempPath = $audioInfo['path'];

            try {
                $response = $this->client->generativeModel(model: $this->model)
                    ->withGenerationConfig(new GenerationConfig(
                        responseMimeType: ResponseMimeType::APPLICATION_JSON,
                        responseSchema: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'fluency' => new Schema(type: DataType::STRING),
                                'vocabulary' => new Schema(type: DataType::STRING),
                                'grammar' => new Schema(type: DataType::STRING),
                                'pronunciation' => new Schema(type: DataType::STRING),
                                'interaction' => new Schema(type: DataType::STRING),
                                'score' => new Schema(type: DataType::NUMBER),
                                'level' => new Schema(type: DataType::STRING),
                                'transcript' => new Schema(type: DataType::STRING),
                                'detected_language' => new Schema(type: DataType::STRING),
                                'is_relevant' => new Schema(type: DataType::BOOLEAN),
                            ],
                            required: ['score', 'level', 'transcript', 'fluency', 'vocabulary', 'grammar', 'pronunciation', 'interaction', 'detected_language', 'is_relevant']
                        )
                    ))
                    ->generateContent([
                        $instruction,
                        new Blob(
                            mimeType: $mimeType,
                            data: base64_encode(file_get_contents($tempPath))
                        ),
                    ]);
            } finally {
                if ($tempPath !== $fullPath && file_exists($tempPath)) {
                    @unlink($tempPath);
                }
            }

            return $response->text();
        } catch (\Exception $e) {
            throw $e;
        }
    }

    private function getPhysicalPath(string $path): string
    {
        $cleanPath = str_replace(['/storage/', 'storage/'], '', $path);

        return storage_path('app/public/'.ltrim($cleanPath, '/'));
    }

    private function getMimeType(string $filePath): MimeType
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'mp3' => MimeType::AUDIO_MP3,
            'wav' => MimeType::AUDIO_WAV,
            'ogg' => MimeType::AUDIO_OGG,
            default => MimeType::AUDIO_MP3,
        };
    }

    private function getCompatibleAudio(string $fullPath): array
    {
        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        // Preferred formats for Gemini
        if (in_array($extension, ['mp3', 'wav'])) {
            return [
                'path' => $fullPath,
                'mimeType' => $this->getMimeType($fullPath),
            ];
        }

        // Convert to wav if not compatible (e.g. webm)
        $tempDir = storage_path('app/tmp');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        $tempPath = $tempDir.'/'.uniqid('audio_', true).'.wav';

        // Use ffmpeg for conversion
        $command = 'ffmpeg -y -i '.escapeshellarg($fullPath).' -ar 16000 -ac 1 '.escapeshellarg($tempPath).' 2>&1';
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            Log::error('FFMPEG Conversion Failed: '.implode("\n", $output));

            // Return original if conversion fails, hoping Gemini handles it
            return [
                'path' => $fullPath,
                'mimeType' => $this->getMimeType($fullPath),
            ];
        }

        return [
            'path' => $tempPath,
            'mimeType' => MimeType::AUDIO_WAV,
        ];
    }
}
