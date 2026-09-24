<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Test;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttemptController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Start a new speaking attempt
     */
    public function start(Request $request)
    {
        $request->validate([
            'test_id' => 'required|exists:tests,id',
            'part_ids' => 'nullable|array',
            'part_ids.*' => 'exists:parts,id',
        ]);

        try {
            DB::beginTransaction();

            $test = Test::with('parts.questions')->findOrFail($request->test_id);

            if ($test->parts->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ushbu testda bo\'limlar mavjud emas.',
                ], 400);
            }

            $attempt = Attempt::create([
                'user_id' => Auth::id(),
                'test_id' => $test->id,
                'name' => $test->name,
                'started_at' => now(),
            ]);

            $partIds = $request->input('part_ids');
            $partsToAttempt = $test->parts;
            if (is_array($partIds) && count($partIds) > 0) {
                $partsToAttempt = $partsToAttempt->whereIn('id', $partIds);
            }

            foreach ($partsToAttempt as $part) {
                AttemptPart::create([
                    'attempt_id' => $attempt->id,
                    'part_id' => $part->id,
                ]);
            }

            DB::commit();

            $attempt->load([
                'test.language',
                'attempt_parts.part.questions' => function ($query) {
                    $query->select('id', 'part_id', 'textarea', 'audio_path', 'ready_second', 'answer_second');
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $attempt,
                'message' => 'Imtihon muvaffaqiyatli boshlandi.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('API Attempt start error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attempt status and details
     */
    public function show($id)
    {
        try {
            $attempt = Attempt::query()
                ->select('attempts.*')
                ->withAiScoreAvg()
                ->with([
                    'test.language',
                    'mock',
                    'attempt_parts.part.questions',
                    'attempt_parts.attempt_answers.question',
                ])
                ->where('user_id', Auth::id())
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $attempt,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Imtihon ma\'lumoti topilmadi.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('API Attempt show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload recorded voice answers for an attempt part
     */
    public function uploadPartAnswers(Request $request, $attemptPartId)
    {
        $attemptPart = AttemptPart::with('attempt')->findOrFail($attemptPartId);

        if ($attemptPart->attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Ruxsat berilmagan.',
            ], 403);
        }

        try {
            DB::beginTransaction();

            $answers = $request->input('answers', []);
            // Support JSON string if sent as formdata field
            if (is_string($answers)) {
                $answers = json_decode($answers, true) ?: [];
            }

            foreach ($answers as $index => $answerData) {
                $questionId = $answerData['question_id'] ?? null;
                if (!$questionId) continue;

                $payload = [
                    'started_at' => $answerData['started_at'] ?? now(),
                    'finished_at' => $answerData['finished_at'] ?? now(),
                ];

                // Check file upload in multipart (answers.0.audio, answers.0.audio_path, or audio_12)
                $fileKey = "answers.{$index}.audio";
                $altKey = "answers.{$index}.audio_path";
                if ($request->hasFile($fileKey)) {
                    $payload['audio_path'] = $this->fileUploadService->uploadAudio(
                        $request->file($fileKey),
                        'attempt_answers_audio'
                    );
                } elseif ($request->hasFile($altKey)) {
                    $payload['audio_path'] = $this->fileUploadService->uploadAudio(
                        $request->file($altKey),
                        'attempt_answers_audio'
                    );
                } elseif ($request->hasFile("audio_{$questionId}")) {
                    $payload['audio_path'] = $this->fileUploadService->uploadAudio(
                        $request->file("audio_{$questionId}"),
                        'attempt_answers_audio'
                    );
                }

                AttemptAnswer::updateOrCreate(
                    [
                        'attempt_part_id' => $attemptPart->id,
                        'question_id' => $questionId,
                    ],
                    $payload
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Javoblar muvaffaqiyatli saqlandi.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('API upload answers error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Finish exam attempt
     */
    public function finish($id)
    {
        try {
            $attempt = Attempt::where('user_id', Auth::id())->findOrFail($id);
            $attempt->update([
                'finished_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $attempt,
                'message' => 'Imtihon yakunlandi.',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Imtihon topilmadi.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('API Attempt finish error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current user's past attempts
     */
    public function myAttempts(Request $request)
    {
        $attempts = Attempt::query()
            ->select('attempts.*')
            ->withAiScoreAvg()
            ->with([
                'test.language',
                'mock',
                'attempt_parts.attempt_answers',
            ])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $attempts->items(),
            'meta' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'per_page' => $attempts->perPage(),
                'total' => $attempts->total(),
            ],
        ]);
    }

    /**
     * Record anti-cheat violation
     */
    public function recordViolation(Request $request, $id)
    {
        $attempt = Attempt::where('user_id', Auth::id())->findOrFail($id);
        $count = (int) $request->input('count', 1);
        $attempt->increment('tab_switch_count', $count);

        return response()->json([
            'success' => true,
            'tab_switch_count' => $attempt->fresh()->tab_switch_count,
        ]);
    }
}
