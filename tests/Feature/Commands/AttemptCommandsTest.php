<?php

namespace Tests\Feature\Commands;

use App\Jobs\EvaluateSpeakingJob;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Language;
use App\Models\Part;
use App\Models\Question;
use App\Models\Test as ModelTest;
use App\Models\User\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttemptCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_clean_old_attempts_command_deletes_records_older_than_days()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $language = Language::factory()->create();
        $test = ModelTest::factory()->create([
            'language_id' => $language->id,
            'user_id' => $user->id,
            'name' => 'Sample Test',
        ]);

        // 1. Create an attempt older than 10 days (11 days ago)
        $oldAttempt = Attempt::factory()->create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'name' => 'Old Attempt',
            'started_at' => now()->subDays(11),
            'created_at' => now()->subDays(11),
        ]);
        $part = Part::factory()->create([
            'test_id' => $test->id,
            'name' => 'Sample Part',
        ]);
        $oldAttemptPart = AttemptPart::factory()->create([
            'attempt_id' => $oldAttempt->id,
            'part_id' => $part->id,
            'started_at' => now()->subDays(11),
        ]);
        $question = Question::factory()->create([
            'part_id' => $part->id,
            'textarea' => 'Question 1',
        ]);
        $oldAnswer = new AttemptAnswer;
        $oldAnswer->attempt_part_id = $oldAttemptPart->id;
        $oldAnswer->question_id = $question->id;
        $oldAnswer->started_at = now()->subDays(11);
        $oldAnswer->audio_path = '/storage/attempt_answers_audio/old-audio.mp3';
        $oldAnswer->created_at = now()->subDays(11);
        $oldAnswer->saveQuietly();

        // Write fake file to storage
        Storage::disk('public')->put('attempt_answers_audio/old-audio.mp3', 'fake content');

        // 2. Create a recent attempt (5 days ago)
        $recentAttempt = Attempt::factory()->create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'name' => 'Recent Attempt',
            'started_at' => now()->subDays(5),
            'created_at' => now()->subDays(5),
        ]);
        $recentAttemptPart = AttemptPart::factory()->create([
            'attempt_id' => $recentAttempt->id,
            'part_id' => $part->id,
            'started_at' => now()->subDays(5),
        ]);
        $recentAnswer = new AttemptAnswer;
        $recentAnswer->attempt_part_id = $recentAttemptPart->id;
        $recentAnswer->question_id = $question->id;
        $recentAnswer->started_at = now()->subDays(5);
        $recentAnswer->audio_path = '/storage/attempt_answers_audio/recent-audio.mp3';
        $recentAnswer->saveQuietly();

        Storage::disk('public')->put('attempt_answers_audio/recent-audio.mp3', 'fake content');

        // Run the artisan command for 10 days threshold
        $this->artisan('attempts:clean-old 10')
            ->expectsOutputToContain('Starting audio cleanup for answers older than 10 days')
            ->expectsOutputToContain('Audio cleanup finished: 1 audio files')
            ->assertSuccessful();

        // Old audio is removed, but attempts, parts and answers (scores/transcripts) are preserved
        $this->assertDatabaseHas('attempts', ['id' => $oldAttempt->id]);
        $this->assertDatabaseHas('attempt_parts', ['id' => $oldAttemptPart->id]);
        $this->assertDatabaseHas('attempt_answers', ['id' => $oldAnswer->id, 'audio_path' => null]);
        Storage::disk('public')->assertMissing('attempt_answers_audio/old-audio.mp3');

        // Assert recent records still exist
        $this->assertDatabaseHas('attempts', ['id' => $recentAttempt->id]);
        $this->assertDatabaseHas('attempt_parts', ['id' => $recentAttemptPart->id]);
        $this->assertDatabaseHas('attempt_answers', ['id' => $recentAnswer->id]);
        Storage::disk('public')->assertExists('attempt_answers_audio/recent-audio.mp3');
    }

    public function test_evaluate_recent_attempts_command_dispatches_only_recent_unrated_answers()
    {
        Queue::fake([EvaluateSpeakingJob::class]);

        $user = User::factory()->create();
        $language = Language::factory()->create();
        $test = ModelTest::factory()->create([
            'language_id' => $language->id,
            'user_id' => $user->id,
            'name' => 'Sample Test',
        ]);
        $part = Part::factory()->create([
            'test_id' => $test->id,
            'name' => 'Sample Part',
        ]);
        $question = Question::factory()->create([
            'part_id' => $part->id,
            'textarea' => 'Question 1',
        ]);

        // 1. Old unrated answer (11 days ago)
        $oldAttempt = Attempt::factory()->create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'name' => 'Old Attempt',
            'started_at' => now()->subDays(11),
        ]);
        $oldAttemptPart = AttemptPart::factory()->create([
            'attempt_id' => $oldAttempt->id,
            'part_id' => $part->id,
            'started_at' => now()->subDays(11),
        ]);
        $oldAnswer = new AttemptAnswer;
        $oldAnswer->attempt_part_id = $oldAttemptPart->id;
        $oldAnswer->question_id = $question->id;
        $oldAnswer->started_at = now()->subDays(11);
        $oldAnswer->audio_path = '/storage/attempt_answers_audio/old-audio.mp3';
        $oldAnswer->saveQuietly();

        // 2. Recent unrated answer (5 days ago)
        $recentAttempt = Attempt::factory()->create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'name' => 'Recent Attempt',
            'started_at' => now()->subDays(5),
        ]);
        $recentAttemptPart = AttemptPart::factory()->create([
            'attempt_id' => $recentAttempt->id,
            'part_id' => $part->id,
            'started_at' => now()->subDays(5),
        ]);
        $recentAnswer = new AttemptAnswer;
        $recentAnswer->attempt_part_id = $recentAttemptPart->id;
        $recentAnswer->question_id = $question->id;
        $recentAnswer->started_at = now()->subDays(5);
        $recentAnswer->audio_path = '/storage/attempt_answers_audio/recent-audio.mp3';
        $recentAnswer->saveQuietly();

        // 3. Recent rated answer (already evaluated)
        $question2 = Question::factory()->create([
            'part_id' => $part->id,
            'textarea' => 'Question 2',
        ]);
        $ratedAnswer = new AttemptAnswer;
        $ratedAnswer->attempt_part_id = $recentAttemptPart->id;
        $ratedAnswer->question_id = $question2->id;
        $ratedAnswer->started_at = now()->subDays(3);
        $ratedAnswer->audio_path = '/storage/attempt_answers_audio/rated-audio.mp3';
        $ratedAnswer->score_ai = 80;
        $ratedAnswer->saveQuietly();

        // Run artisan command to evaluate recent 10 days
        $this->artisan('attempts:evaluate-recent 10')
            ->expectsOutputToContain('Found 1 unrated attempt answers from the last 10 days. Dispatching to queue...')
            ->expectsOutputToContain('Successfully dispatched 1 evaluation jobs to the queue.')
            ->assertSuccessful();

        // Verify only the recent unrated answer was pushed
        Queue::assertPushed(EvaluateSpeakingJob::class, function ($job) use ($recentAnswer) {
            $ref = new \ReflectionProperty($job, 'answerId');
            $ref->setAccessible(true);

            return $ref->getValue($job) === $recentAnswer->id;
        });

        Queue::assertNotPushed(EvaluateSpeakingJob::class, function ($job) use ($oldAnswer) {
            $ref = new \ReflectionProperty($job, 'answerId');
            $ref->setAccessible(true);

            return $ref->getValue($job) === $oldAnswer->id;
        });

        Queue::assertNotPushed(EvaluateSpeakingJob::class, function ($job) use ($ratedAnswer) {
            $ref = new \ReflectionProperty($job, 'answerId');
            $ref->setAccessible(true);

            return $ref->getValue($job) === $ratedAnswer->id;
        });
    }
}
