<?php

namespace Tests\Feature\Jobs;

use App\Jobs\EvaluateSpeakingJob;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Language;
use App\Models\Question;
use App\Models\Test as ExamTest;
use App\Services\GeminiAiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluateSpeakingJobTest extends TestCase
{
    use RefreshDatabase;

    private function answer(): AttemptAnswer
    {
        $language = Language::factory()->create(['name_en' => 'English']);
        $test = ExamTest::factory()->create(['language_id' => $language->id]);
        $part = $test->parts()->first();
        $question = Question::factory()->create(['part_id' => $part->id]);
        $attemptPart = AttemptPart::factory()->create(['part_id' => $part->id]);

        $answer = new AttemptAnswer(['audio_path' => '/storage/attempt_answers_audio/x.mp3']);
        $answer->attempt_part_id = $attemptPart->id;
        $answer->question_id = $question->id;
        $answer->started_at = now();
        $answer->saveQuietly();

        return $answer;
    }

    private function fakeGemini(string|\Throwable $result): void
    {
        $this->mock(GeminiAiService::class, function ($mock) use ($result) {
            $expectation = $mock->shouldReceive('evaluateSpeakingDirectly');
            $result instanceof \Throwable ? $expectation->andThrow($result) : $expectation->andReturn($result);
        });
    }

    public function test_score_is_clamped_to_the_cefr_scale(): void
    {
        $answer = $this->answer();
        $this->fakeGemini(json_encode(['score' => 120, 'transcript' => 'I like my city a lot.', 'detected_language' => 'English', 'is_relevant' => true]));

        EvaluateSpeakingJob::dispatchSync($answer->id);

        $this->assertSame(75, $answer->fresh()->score_ai);
        $this->assertSame(75, json_decode($answer->fresh()->review_ai, true)['score']);
        $this->assertSame('I like my city a lot.', $answer->fresh()->transcript);
    }

    public function test_wrong_language_or_irrelevant_answers_score_zero(): void
    {
        $answer = $this->answer();
        $this->fakeGemini(json_encode(['score' => 60, 'transcript' => 'Salom dunyo', 'detected_language' => 'Uzbek', 'is_relevant' => true]));

        EvaluateSpeakingJob::dispatchSync($answer->id);

        $this->assertSame(0, $answer->fresh()->score_ai);
    }

    public function test_silence_stores_consistent_analysis(): void
    {
        $answer = $this->answer();
        $this->fakeGemini(json_encode(['score' => 10, 'level' => 'A2', 'transcript' => '[SILENCE]', 'detected_language' => 'Noise', 'is_relevant' => true]));

        EvaluateSpeakingJob::dispatchSync($answer->id);

        $fresh = $answer->fresh();
        $review = json_decode($fresh->review_ai, true);
        $this->assertSame(0, $fresh->score_ai);
        $this->assertSame(0, $review['score']);
        $this->assertSame('Below A1', $review['level']);
        $this->assertSame('no_speech', $review['override_reason']);
    }

    public function test_api_errors_propagate_for_retry_and_failed_hook_records_the_error(): void
    {
        $answer = $this->answer();
        $this->fakeGemini(new \RuntimeException('Gemini unavailable'));
        $job = new EvaluateSpeakingJob($answer->id);

        try {
            app()->call([$job, 'handle']);
            $this->fail('The exception must propagate so the queue can retry.');
        } catch (\RuntimeException $e) {
            $this->assertSame('Gemini unavailable', $e->getMessage());
        }

        $job->failed(new \RuntimeException('Gemini unavailable'));

        $this->assertStringContainsString('AI Error: Gemini unavailable', $answer->fresh()->review_ai);
        $this->assertNull($answer->fresh()->score_ai);
        $this->assertSame(180, $job->timeout);
        $this->assertSame(3, $job->tries);
    }

    public function test_missing_question_is_skipped_quietly(): void
    {
        $answer = $this->answer();
        $answer->question->delete();
        $this->mock(GeminiAiService::class)->shouldNotReceive('evaluateSpeakingDirectly');

        EvaluateSpeakingJob::dispatchSync($answer->id);

        $this->assertNull($answer->fresh()->score_ai);
    }
}
