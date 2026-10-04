<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptRequest;
use App\Jobs\EvaluateSpeakingJob;
use App\Models\Attempt;
use App\Models\Mock;
use App\Models\Test;
use App\Services\Telegram\MultitestUzBotService;
use App\Support\Pagination;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
            $per_page = Pagination::perPage($request, 10);

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

            foreach (['user_id', 'mock_id', 'test_id'] as $column) {
                if ($request->filled($column)) {
                    $attempt->where($column, $request->input($column));
                }
            }

            if ($request->filled('search')) {
                $search = '%'.$request->input('search').'%';
                $attempt->where(function ($outer) use ($search) {
                    $outer->where('attempts.name', 'like', $search)
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where(function ($w) use ($search) {
                                $w->where('name', 'like', $search)
                                    ->orWhere('email', 'like', $search)
                                    ->orWhere('phone', 'like', $search);
                            });
                        })
                        ->orWhereHas('mockStudent', fn ($q) => $q->where('name', 'like', $search))
                        ->orWhereHas('test', fn ($q) => $q->where('name', 'like', $search))
                        ->orWhereHas('mock', fn ($q) => $q->where('name', 'like', $search));
                });
            }

            if ($request->filled('role') && $request->input('role') !== '0') {
                $role = $request->input('role');
                $attempt->whereHas('user.roles', function ($query) use ($role) {
                    $query->where('name', $role);
                });
            }

            $authUser = Auth::user();
            if ($authUser->hasRole('Admin')) {
                // Admin sees every attempt
            } elseif ($authUser->hasRole('Teacher')) {
                $attempt->where(function ($query) {
                    $query->whereHas('mock', fn ($q) => $q->where('user_id', Auth::id()))
                        ->orWhereHas('test', fn ($q) => $q->where('user_id', Auth::id()))
                        ->orWhere('user_id', Auth::id());
                });
            } else {
                $attempt->where('user_id', Auth::id());
            }

            $attempt = $attempt->paginate($per_page);

            if ($request->wantsJson()) {
                return response()->json($attempt);
            }

            return Inertia::render('attempt/index', [
                'attempt' => $attempt,
            ]);

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttemptRequest $request)
    {
        try {
            $data = $request->validated();
            $data['name'] = (! empty($data['mock_id']) ? Mock::whereKey($data['mock_id'])->value('name') : null)
                ?? Test::whereKey($data['test_id'])->value('name')
                ?? 'Attempt';

            $attempt = DB::transaction(function () use ($data, $request) {
                $attempt = Attempt::create($data);
                $attempt->load('test.parts');

                if ($attempt->test->parts->isEmpty()) {
                    throw ValidationException::withMessages(['error' => ['The selected test has no parts defined.']]);
                }

                $partIds = $request->input('part_ids');
                $partsToAttempt = $attempt->test->parts;

                if (is_array($partIds) && count($partIds) > 0) {
                    $partsToAttempt = $partsToAttempt->whereIn('id', $partIds);
                }

                if ($partsToAttempt->isEmpty()) {
                    throw ValidationException::withMessages(['error' => ['No valid parts selected for the attempt.']]);
                }

                $attempt->attempt_parts()->createMany(
                    $partsToAttempt->map(fn ($part) => ['part_id' => $part->id, 'started_at' => now()])->values()->toArray()
                );

                return $attempt;
            });

            return redirect()->route('practice.index', $attempt->id)
                ->with('success', 'Attempt created successfully.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
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

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }

    public function evaluate(Request $request, Attempt $attempt)
    {
        try {
            $this->authorize('evaluate', $attempt);
            $request->validate([
                'score' => 'required|integer|min:0|max:75',
                'review' => 'nullable|string',
            ]);

            $attempt->score = $request->input('score');
            $attempt->review = $request->input('review');
            $attempt->evaluated_at = now();
            $attempt->save();

            // Send Telegram Notification if applicable
            try {
                app(MultitestUzBotService::class)->sendAttemptResultNotification($attempt);
            } catch (\Throwable $e) {
                \Log::warning('Telegram notification failed on evaluate: '.$e->getMessage());
            }

            return redirect()->back()->with('success', 'Attempt evaluated successfully.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
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

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
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

                        EvaluateSpeakingJob::dispatch($answer->id);
                    }
                }
            }

            return redirect()->back()->with('success', 'Full re-evaluation started. All questions are being re-processed.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }
}
