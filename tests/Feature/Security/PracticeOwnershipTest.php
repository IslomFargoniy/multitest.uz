<?php

namespace Tests\Feature\Security;

use App\Models\Attempt;
use App\Models\AttemptPart;
use App\Models\Mock;
use App\Models\MockStudent;
use App\Models\Question;
use App\Models\Test as ExamTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class PracticeOwnershipTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private function setupAttempt($owner = null): array
    {
        $test = ExamTest::factory()->create(['is_public' => true]);
        $part = $test->parts()->first();
        $question = Question::factory()->create(['part_id' => $part->id]);
        $attempt = Attempt::factory()->create(['user_id' => $owner?->id, 'test_id' => $test->id]);
        $attemptPart = AttemptPart::factory()->create(['attempt_id' => $attempt->id, 'part_id' => $part->id]);

        return [$attempt, $attemptPart, $question];
    }

    public function test_other_user_cannot_open_save_or_violate_someone_elses_attempt(): void
    {
        [$attempt, $attemptPart, $question] = $this->setupAttempt($this->student());
        $intruder = $this->student();

        $this->actingAs($intruder)->get(route('practice.index', $attempt))->assertForbidden();
        $this->actingAs($intruder)->get(route('practice.show', $attemptPart))->assertForbidden();
        $this->actingAs($intruder)->postJson(route('practice.save_answers', $attemptPart), ['finish' => 1])->assertForbidden();
        $this->actingAs($intruder)->postJson(route('practice-attempt-violation', $attempt))->assertForbidden();

        $this->assertNull($attempt->fresh()->finished_at);
        $this->assertSame(0, $attempt->fresh()->tab_switch_count);
    }

    public function test_owner_can_save_incrementally_and_finish_explicitly(): void
    {
        Storage::fake('public');
        $owner = $this->student();
        [$attempt, $attemptPart, $question] = $this->setupAttempt($owner);

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), [
            'answers' => [['question_id' => $question->id, 'audio_path' => UploadedFile::fake()->create('a.webm', 10, 'audio/webm')]],
        ])->assertOk();

        $this->assertNull($attempt->fresh()->finished_at, 'incremental save must not finish the attempt');
        $this->assertDatabaseHas('attempt_answers', ['attempt_part_id' => $attemptPart->id, 'question_id' => $question->id]);

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), ['finish' => 1])->assertOk();
        $this->assertNotNull($attempt->fresh()->finished_at);
    }

    public function test_question_from_another_part_and_foreign_next_part_are_rejected(): void
    {
        $owner = $this->student();
        [$attempt, $attemptPart, $question] = $this->setupAttempt($owner);
        $foreignQuestion = Question::factory()->create();
        [, $foreignPart] = $this->setupAttempt($this->student());

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), [
            'answers' => [['question_id' => $foreignQuestion->id]],
        ])->assertStatus(422)->assertJsonValidationErrors('answers.0.question_id');

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), [
            'next_attempt_part_id' => $foreignPart->id,
        ])->assertStatus(422)->assertJsonValidationErrors('next_attempt_part_id');
    }

    public function test_non_audio_upload_is_rejected(): void
    {
        $owner = $this->student();
        [, $attemptPart, $question] = $this->setupAttempt($owner);

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), [
            'answers' => [['question_id' => $question->id, 'audio_path' => UploadedFile::fake()->create('x.html', 5, 'text/html')]],
        ])->assertStatus(422);
    }

    public function test_finished_attempt_rejects_late_saves_after_grace(): void
    {
        $owner = $this->student();
        [$attempt, $attemptPart, $question] = $this->setupAttempt($owner);
        $attempt->update(['finished_at' => now()->subHour()]);

        $this->actingAs($owner)->postJson(route('practice.save_answers', $attemptPart), [
            'answers' => [['question_id' => $question->id]],
        ])->assertStatus(422);
    }

    public function test_violation_always_counts_one_and_ignores_client_count(): void
    {
        $owner = $this->student();
        [$attempt] = $this->setupAttempt($owner);

        $this->actingAs($owner)->postJson(route('practice-attempt-violation', $attempt), ['count' => -50])->assertOk();
        $this->actingAs($owner)->postJson(route('practice-attempt-violation', $attempt), ['count' => 9999])->assertOk();

        $this->assertSame(2, $attempt->fresh()->tab_switch_count);
    }

    public function test_candidate_session_only_reaches_its_own_attempt(): void
    {
        $mock = Mock::factory()->create();
        $mine = MockStudent::factory()->create(['mock_id' => $mock->id]);
        $other = MockStudent::factory()->create(['mock_id' => $mock->id]);
        $part = $mock->test->parts()->first();
        $myAttempt = Attempt::factory()->create(['user_id' => null, 'mock_id' => $mock->id, 'mock_student_id' => $mine->id, 'test_id' => $mock->test_id]);
        $otherAttempt = Attempt::factory()->create(['user_id' => null, 'mock_id' => $mock->id, 'mock_student_id' => $other->id, 'test_id' => $mock->test_id]);
        $otherPart = AttemptPart::factory()->create(['attempt_id' => $otherAttempt->id, 'part_id' => $part->id]);

        $session = ['mock_student_id' => $mine->id, 'mock_attempt_id' => $myAttempt->id];

        $this->withSession($session)->get(route('practice.index', $myAttempt))->assertOk();
        $this->withSession($session)->get(route('practice.index', $otherAttempt))->assertForbidden();
        $this->withSession($session)->get(route('practice.show', $otherPart))->assertForbidden();
        $this->withSession($session)->postJson(route('practice-attempt-violation', $otherAttempt))->assertForbidden();
    }

    public function test_anonymous_visitor_is_blocked(): void
    {
        [$attempt] = $this->setupAttempt($this->student());

        $this->get(route('practice.index', $attempt))->assertRedirect(route('login'));
    }
}
