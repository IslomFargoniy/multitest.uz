<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptRequest;
use App\Http\Requests\UpdateAttemptRequest;
use App\Models\Attempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttemptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->per_page) {
                $per_page = $request->per_page;
            } else {
                $per_page = 10;
            }

            $attempt = Attempt::query()
                ->select('attempts.*')
                ->withAiScoreAvg()
                ->with([
                    'user.roles',
                    'mock',
                    'mockStudent',
                    'test.language',
                    'attempt_parts' => function ($query) {
                        $query->withAvg('attempt_answers as ai_score_avg', 'score_ai');
                    },
                ])
                ->orderByDesc('created_at');

            if ($request->has('user_id')) {
                $user_id = $request->input('user_id');
                $attempt->where('user_id', $user_id);
            }

            if ($request->has('mock_id')) {
                $mock_id = $request->input('mock_id');
                $attempt->where('mock_id', $mock_id);
            }

            if ($request->has('test_id')) {
                $test_id = $request->input('test_id');
                $attempt->where('test_id', $test_id);
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $attempt->whereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%');
                })->orWhereHas('test', function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%');
                })->orWhereHas('mock', function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%');
                });
            }

            if ($request->has('role') && ! empty($request->input('role')) && $request->input('role') !== '0') {
                $role = $request->input('role');
                $attempt->whereHas('user.roles', function ($query) use ($role) {
                    $query->where('name', $role);
                });
            }

            if (Auth::user()->hasRole('Teacher')) {
                $attempt->where(function ($query) {
                    $query->whereHas('mock', function ($query) {
                        $query->where('user_id', Auth::id());
                    })
                        ->orWhereHas('test', function ($query) {
                            $query->where('user_id', Auth::id());
                        })
                        ->orWhere('user_id', Auth::id());
                });
            } elseif (Auth::user()->hasRole('Student')) {
                $attempt->where('user_id', Auth::id());
            }

            $attempt = $attempt->paginate($per_page);

            if ($request->wantsJson()) {
                return response()->json($attempt);
            }

            return Inertia::render('attempt/index', [
                'attempt' => $attempt,
            ]);

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttemptRequest $request)
    {
        try {
            $data = $request->validated();

            DB::beginTransaction();

            // Eager load parts with test
            $attempt = Attempt::create($data);
            $attempt->load('test.parts');

            if ($attempt->test->parts->isEmpty()) {
                throw new \Exception('The selected test has no parts defined.');
            }

            // Filter parts if part_ids are provided
            $partIds = $request->input('part_ids');
            $partsToAttempt = $attempt->test->parts;

            if (is_array($partIds) && count($partIds) > 0) {
                $partsToAttempt = $partsToAttempt->whereIn('id', $partIds);
            }

            if ($partsToAttempt->isEmpty()) {
                throw new \Exception('No valid parts selected for the attempt.');
            }

            // Create attempt parts
            $attemptParts = $partsToAttempt->map(function ($part) {
                return [
                    'part_id' => $part->id,
                    'started_at' => now(),
                ];
            })->toArray();

            $attempt->attempt_parts()->createMany($attemptParts);

            DB::commit();

            return redirect()->route('practice.index', $attempt->id)
                ->with('success', 'Attempt created successfully.');

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Attempt $attempt)
    {
        try {
            $this->authorize('view', $attempt);
            $resAttempt = Attempt::query()
                ->select('attempts.*')
                ->where('id', '=', $attempt->id)
                ->withAiScoreAvg()
                ->with([
                    'user',
                    'mock',
                    'test',
                    'attempt_parts.attempt_answers.question',
                    'attempt_parts.part',
                    'attempt_parts' => function ($query) {
                        $query->withAvg('attempt_answers as ai_score_avg', 'score_ai');
                    },
                ])
                ->firstOrFail();

            return Inertia::render('attempt/show', [
                'attempt' => $resAttempt,
            ]);

        } catch (\Exception $exception) {
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attempt $attempt)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptRequest $request, Attempt $attempt)
    {
        //
    }

    public function evaluate(Request $request, Attempt $attempt)
    {
        try {
            $this->authorize('update', $attempt);
            $request->validate([
                'score' => 'required|numeric|min:0|max:75',
                'review' => 'nullable|string',
            ]);

            $attempt->score = $request->input('score');
            $attempt->review = $request->input('review');
            $attempt->evaluated_at = now();
            $attempt->save();

            // Send Telegram Notification if applicable
            try {
                app(\App\Services\Telegram\MultitestUzBotService::class)->sendAttemptResultNotification($attempt);
            } catch (\Exception $e) {
                \Log::warning('Telegram notification failed on evaluate: '.$e->getMessage());
            }

        } catch (\Exception $exception) {
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attempt $attempt)
    {
        try {
            $this->authorize('delete', $attempt);
            $attempt->delete();

            return redirect()->back()->with('success', 'Attempt deleted successfully.');

        } catch (\Exception $exception) {
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    public function reEvaluate(Attempt $attempt)
    {
        try {
            $this->authorize('update', $attempt);
            if (! auth()->user()->hasAnyRole(['Admin', 'Teacher'])) {
                abort(403);
            }

            $attempt->load('attempt_parts.attempt_answers');

            foreach ($attempt->attempt_parts as $attemptPart) {
                foreach ($attemptPart->attempt_answers as $answer) {
                    if ($answer->audio_path) {
                        $answer->score_ai = null;
                        $answer->transcript = null;
                        $answer->review_ai = null;
                        $answer->save();

                        \App\Jobs\EvaluateSpeakingJob::dispatch($answer->id);
                    }
                }
            }

            return redirect()->back()->with('success', 'Full re-evaluation started. All questions are being re-processed.');

        } catch (\Exception $exception) {
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }
}
