<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\AttemptPart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

use App\Services\FileUploadService;

class PracticeController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }
    public function index(Attempt $attempt)
    {
        try {
            $attempt->load([
                'mock',
                'test',
                'attempt_parts.part.questions'
            ]);

            if ($attempt->finished_at) {
                return redirect()->route('home.index', [
                    'slug' => $attempt->mock->slug,
                ])->with('success', 'Answers saved successfully.');
            }

            return inertia('practice/index', [
                'attempt' => $attempt,
            ]);


        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {


            throw $exception;


        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }

    }

    public function show(AttemptPart $attemptPart)
    {
        try {
            $attemptPart->load([
                'attempt.attempt_parts.part',
                'part.questions'
            ]);

            return inertia('practice/show', [
                'attempt_part' => $attemptPart,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    public function save_answers(AttemptPart $attemptPart, Request $request)
    {
        try {
            $data = $request->validate([
                'answers' => ['nullable', 'array'],
                'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
                'answers.*.started_at' => ['nullable', 'date'],
                'answers.*.finished_at' => ['nullable', 'date'],
                'answers.*.audio_path' => ['nullable', 'file', 'max:200000', 'mimetypes:audio/mpeg,audio/wav,audio/ogg,audio/x-wav,audio/webm,video/webm'], // Validating inside the array
                'next_attempt_part_id' => ['nullable', 'integer', 'exists:attempt_parts,id'],
            ]);

            DB::beginTransaction();

            $answers = $data['answers'] ?? [];
            foreach ($answers as $index => $answerData) {
                $payload = [
                    'started_at' => $answerData['started_at'] ?? null,
                    'finished_at' => $answerData['finished_at'] ?? null,
                ];

                if ($request->hasFile("answers.$index.audio_path")) {
                    $payload['audio_path'] = $this->fileUploadService->uploadAudio($request->file("answers.$index.audio_path"), 'attempt_answers_audio');
                }

                \App\Models\AttemptAnswer::updateOrCreate(
                    [
                        'attempt_part_id' => $attemptPart->id,
                        'question_id' => $answerData['question_id'],
                    ],
                    $payload
                );
            }

            DB::commit();

            if (!empty($data['next_attempt_part_id'])) {
                $redirectUrl = route('practice.show', $data['next_attempt_part_id']);
                if ($request->ajax() || $request->wantsJson()) {
                    return response()->json(['redirect' => $redirectUrl]);
                }
                return redirect()->to($redirectUrl);
            }

            $attemptPart->attempt()->update(['finished_at' => now()]);

            if ($attemptPart->attempt->mock) {
                $redirectUrl = route('home.index', ['slug' => $attemptPart->attempt->mock?->slug]);
            } else {
                $redirectUrl = route('attempt.index');
            }

            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['redirect' => $redirectUrl, 'message' => 'Answers saved successfully.']);
            }

            return redirect()->to($redirectUrl)->with('success', 'Answers saved successfully.');


        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {


            throw $exception;


        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
            throw \Illuminate\Validation\ValidationException::withMessages(['error' => [$exception->getMessage()]]);
        }
    }

    /**
     * Record anti-cheat violation (tab switch, focus loss)
     */
    public function recordViolation(Request $request, $attempt_id)
    {
        try {
            $attempt = Attempt::findOrFail($attempt_id);
            $count = (int) $request->input('count', 1);
            $attempt->increment('tab_switch_count', $count);

            return response()->json([
                'success' => true,
                'tab_switch_count' => $attempt->fresh()->tab_switch_count,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
