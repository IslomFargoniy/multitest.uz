<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Services\FileUploadService;
use App\Support\AudioUpload;
use App\Support\ClientTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PracticeController extends Controller
{
    /** Minutes after finishing during which late (in-flight) answer uploads are still accepted. */
    private const LATE_UPLOAD_GRACE_MINUTES = 10;

    public function __construct(protected FileUploadService $fileUploadService) {}

    /**
     * Only the attempt owner, the candidate that entered through the mock code, or an admin may use the attempt.
     */
    private function authorizeAttempt(Attempt $attempt): void
    {
        $user = auth()->user();

        if ($user && ($user->hasRole('Admin') || ($attempt->user_id !== null && $attempt->user_id === $user->id))) {
            return;
        }

        $studentId = session('mock_student_id');
        if ($studentId && $attempt->mock_student_id !== null
            && (int) $studentId === (int) $attempt->mock_student_id
            && (int) session('mock_attempt_id') === (int) $attempt->id) {
            return;
        }

        abort(403);
    }

    private function finishedRedirectUrl(Attempt $attempt): string
    {
        $attempt->loadMissing('mock');

        if ($attempt->mock) {
            return route('home.index', ['slug' => $attempt->mock->slug]);
        }

        return auth()->check() ? route('attempt.show', $attempt->id) : url('/');
    }

    public function index(Attempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        if ($attempt->finished_at) {
            return redirect()->to($this->finishedRedirectUrl($attempt))
                ->with('success', 'Answers saved successfully.');
        }

        $attempt->load(['mock', 'test', 'attempt_parts.part.questions']);

        return inertia('practice/index', [
            'attempt' => $attempt,
        ]);
    }

    public function show(AttemptPart $attemptPart)
    {
        $this->authorizeAttempt($attemptPart->attempt);

        $attemptPart->load([
            'attempt.attempt_parts.part',
            'part.questions',
        ]);

        return inertia('practice/show', [
            'attempt_part' => $attemptPart,
        ]);
    }

    public function save_answers(AttemptPart $attemptPart, Request $request)
    {
        $attempt = $attemptPart->attempt;
        $this->authorizeAttempt($attempt);

        if ($attempt->finished_at && $attempt->finished_at->lt(now()->subMinutes(self::LATE_UPLOAD_GRACE_MINUTES))) {
            throw ValidationException::withMessages(['error' => ['This attempt is already finished.']]);
        }

        $data = $request->validate([
            'answers' => ['nullable', 'array', 'max:50'],
            'answers.*.question_id' => [
                'required',
                'integer',
                Rule::exists('questions', 'id')->where('part_id', $attemptPart->part_id)->whereNull('deleted_at'),
            ],
            'answers.*.started_at' => ['nullable', 'date'],
            'answers.*.finished_at' => ['nullable', 'date'],
            'answers.*.audio_path' => AudioUpload::rules(),
            'next_attempt_part_id' => [
                'nullable',
                'integer',
                Rule::exists('attempt_parts', 'id')->where('attempt_id', $attemptPart->attempt_id),
            ],
            'finish' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $request, $attemptPart) {
            foreach ($data['answers'] ?? [] as $index => $answerData) {
                $payload = [
                    'started_at' => ClientTime::parse($answerData['started_at'] ?? null),
                    'finished_at' => ClientTime::parse($answerData['finished_at'] ?? null),
                ];

                if ($request->hasFile("answers.$index.audio_path")) {
                    $payload['audio_path'] = $this->fileUploadService->uploadAudio($request->file("answers.$index.audio_path"), 'attempt_answers_audio');
                }

                AttemptAnswer::updateOrCreate(
                    [
                        'attempt_part_id' => $attemptPart->id,
                        'question_id' => $answerData['question_id'],
                    ],
                    $payload
                );
            }
        });

        if (! empty($data['next_attempt_part_id'])) {
            $redirectUrl = route('practice.show', $data['next_attempt_part_id']);

            return $request->wantsJson()
                ? response()->json(['redirect' => $redirectUrl])
                : redirect()->to($redirectUrl);
        }

        if (! $request->boolean('finish')) {
            return response()->json(['message' => 'Answers saved successfully.']);
        }

        if (! $attempt->finished_at) {
            $attempt->update(['finished_at' => now()]);
        }

        $redirectUrl = $this->finishedRedirectUrl($attempt);

        if ($request->wantsJson()) {
            return response()->json(['redirect' => $redirectUrl, 'message' => 'Answers saved successfully.']);
        }

        return redirect()->to($redirectUrl)->with('success', 'Answers saved successfully.');
    }

    /**
     * Record anti-cheat violation (tab switch, focus loss). Always counts exactly one.
     */
    public function recordViolation(Request $request, Attempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        if ($attempt->finished_at) {
            return response()->json(['success' => true, 'tab_switch_count' => $attempt->tab_switch_count]);
        }

        $attempt->increment('tab_switch_count');

        return response()->json([
            'success' => true,
            'tab_switch_count' => $attempt->fresh()->tab_switch_count,
        ]);
    }
}
