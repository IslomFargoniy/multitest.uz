<?php

namespace Tests\Feature\Security;

use App\Models\Attempt;
use App\Models\Mock;
use App\Models\Test as ExamTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class AttemptAuthorizationTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private function attemptOf($student, $teacher): Attempt
    {
        $test = ExamTest::factory()->create(['user_id' => $teacher->id, 'is_public' => true]);

        return Attempt::factory()->create(['user_id' => $student->id, 'test_id' => $test->id]);
    }

    public function test_student_cannot_evaluate_own_attempt(): void
    {
        $student = $this->student();
        $attempt = $this->attemptOf($student, $this->teacher());

        $this->actingAs($student)->post(route('attempt.evaluate', $attempt), ['score' => 75])->assertForbidden();
        $this->actingAs($student)->post(route('attempt.re_evaluate', $attempt))->assertForbidden();

        $this->assertNull($attempt->fresh()->score);
    }

    public function test_teacher_evaluates_only_attempts_of_own_tests_and_mocks(): void
    {
        $teacher = $this->teacher();
        $other = $this->teacher();
        $student = $this->student();
        $attempt = $this->attemptOf($student, $teacher);
        $foreign = $this->attemptOf($student, $other);

        $this->actingAs($teacher)->post(route('attempt.evaluate', $foreign), ['score' => 10])->assertForbidden();
        $this->actingAs($teacher)->get(route('attempt.show', $foreign))->assertForbidden();

        $this->actingAs($teacher)->get(route('attempt.show', $attempt))->assertOk();
        $this->actingAs($teacher)->post(route('attempt.evaluate', $attempt), ['score' => 60]);
        $this->assertSame(60, $attempt->fresh()->score);
    }

    public function test_teacher_manages_attempt_through_own_mock(): void
    {
        $teacher = $this->teacher();
        $student = $this->student();
        $test = ExamTest::factory()->create(['is_public' => true]);
        $mock = Mock::factory()->create(['user_id' => $teacher->id, 'test_id' => $test->id]);
        $attempt = Attempt::factory()->create(['user_id' => $student->id, 'test_id' => $test->id, 'mock_id' => $mock->id]);

        $this->actingAs($teacher)->get(route('attempt.show', $attempt))->assertOk();
    }

    public function test_student_cannot_view_other_students_attempt(): void
    {
        $teacher = $this->teacher();
        $attempt = $this->attemptOf($this->student(), $teacher);

        $this->actingAs($this->student())->get(route('attempt.show', $attempt))->assertForbidden();
    }

    public function test_store_ignores_client_supplied_score_and_finished_at(): void
    {
        $student = $this->student();
        $test = ExamTest::factory()->create(['is_public' => true]);

        $response = $this->actingAs($student)->post(route('attempt.store'), [
            'test_id' => $test->id,
            'score' => 75,
            'finished_at' => now()->toDateTimeString(),
        ]);
        $response->assertSessionHasNoErrors();

        $attempt = Attempt::where('user_id', $student->id)->firstOrFail();
        $this->assertNull($attempt->score);
        $this->assertNull($attempt->finished_at);
    }

    public function test_student_cannot_start_attempt_on_foreign_private_test(): void
    {
        $student = $this->student();
        $private = ExamTest::factory()->create(['is_public' => false]);

        $this->actingAs($student)->post(route('attempt.store'), ['test_id' => $private->id])
            ->assertSessionHasErrors('test_id');

        $this->assertDatabaseCount('attempts', 0);
    }

    public function test_student_cannot_join_inactive_mock(): void
    {
        $student = $this->student();
        $mock = Mock::factory()->create(['active' => false]);

        $this->actingAs($student)->post(route('attempt.store'), ['mock_id' => $mock->id])
            ->assertSessionHasErrors();

        $this->assertDatabaseCount('attempts', 0);
    }
}
