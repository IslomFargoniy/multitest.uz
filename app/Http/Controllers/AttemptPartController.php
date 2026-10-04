<?php

namespace App\Http\Controllers;

use App\Models\AttemptPart;
use App\Http\Requests\StoreAttemptPartRequest;
use App\Http\Requests\UpdateAttemptPartRequest;

class AttemptPartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreAttemptPartRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptPartRequest $request, AttemptPart $attemptPart)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function reEvaluate(AttemptPart $attemptPart)
    {
        $this->authorize('evaluate', $attemptPart->attempt);

        $attemptPart->load('attempt_answers');

        foreach ($attemptPart->attempt_answers as $answer) {
            if ($answer->audio_path) {
                // Reset AI results to allow the job to run (since it checks for score_ai !== null)
                $answer->score_ai = null;
                $answer->transcript = null;
                $answer->review_ai = null;
                $answer->save();

                \App\Jobs\EvaluateSpeakingJob::dispatch($answer->id);
            }
        }

        return redirect()->back()->with('success', 'Re-evaluation started.');
    }
}
