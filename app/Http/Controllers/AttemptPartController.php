<?php

namespace App\Http\Controllers;

use App\Jobs\EvaluateSpeakingJob;
use App\Models\AttemptPart;

class AttemptPartController extends Controller
{
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

                EvaluateSpeakingJob::dispatch($answer->id);
            }
        }

        return redirect()->back()->with('success', 'Re-evaluation started.');
    }
}
