<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Mock;
use App\Models\MockStudent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class MockEntryTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private function candidate(array $mockAttrs = []): MockStudent
    {
        $mock = Mock::factory()->create($mockAttrs);

        return MockStudent::factory()->create(['mock_id' => $mock->id]);
    }

    public function test_web_entry_creates_attempt_with_started_parts_and_session(): void
    {
        $student = $this->candidate();

        $response = $this->post('/mock-student/enter', ['code' => strtolower($student->code)]);

        $attempt = Attempt::where('mock_student_id', $student->id)->firstOrFail();
        $response->assertRedirect(route('practice.index', $attempt));
        $this->assertGreaterThan(0, $attempt->attempt_parts()->whereNotNull('started_at')->count());
        $this->assertTrue($student->fresh()->attended);
        $this->assertSame($student->id, session('mock_student_id'));
    }

    public function test_reentering_reuses_the_same_attempt(): void
    {
        $student = $this->candidate();

        $this->post('/mock-student/enter', ['code' => $student->code]);
        $this->post('/mock-student/enter', ['code' => $student->code]);

        $this->assertSame(1, Attempt::where('mock_student_id', $student->id)->count());
    }

    public function test_entry_is_refused_outside_time_window_or_when_inactive(): void
    {
        $future = $this->candidate(['started_at' => now()->addDay(), 'starts_at' => now()->addDay()]);
        $past = $this->candidate(['finished_at' => now()->subMinute()]);
        $inactive = $this->candidate(['active' => false]);

        foreach ([$future, $past, $inactive] as $student) {
            $this->post('/mock-student/enter', ['code' => $student->code])->assertSessionHasErrors('code');
        }

        $this->assertDatabaseCount('attempts', 0);
    }

    public function test_api_join_binds_user_and_returns_exam_payload(): void
    {
        $user = $this->student();
        Sanctum::actingAs($user);
        $student = $this->candidate();

        $this->postJson('/api/v1/mocks/join', ['pin' => $student->code])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'test', 'attempt_parts' => [['id', 'part']]]]);

        $this->assertSame($user->id, Attempt::where('mock_student_id', $student->id)->value('user_id'));
    }

    public function test_api_join_rejects_unknown_code_and_other_users_code(): void
    {
        Sanctum::actingAs($first = $this->student());
        $student = $this->candidate();

        $this->postJson('/api/v1/mocks/join', ['pin' => 'MS00000000'])->assertStatus(422)->assertJsonPath('success', false);
        $this->postJson('/api/v1/mocks/join', ['pin' => $student->code])->assertOk();

        Sanctum::actingAs($this->student());
        $this->postJson('/api/v1/mocks/join', ['pin' => $student->code])->assertStatus(422);
    }

    public function test_api_candidate_login_authenticates_and_binds_mock(): void
    {
        $student = $this->candidate();

        $response = $this->postJson('/api/v1/auth/candidate', ['code' => $student->code]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'name', 'token', 'attempt_id']]);

        $this->assertDatabaseHas('attempts', [
            'mock_student_id' => $student->id,
            'id' => $response->json('data.attempt_id'),
        ]);
    }

    public function test_api_reviewer_candidate_code_always_joins_mock(): void
    {
        $test = \App\Models\Test::factory()->create(['is_public' => true]);
        $part = \App\Models\Part::factory()->create(['test_id' => $test->id]);
        \App\Models\Question::factory()->create(['part_id' => $part->id]);

        $response = $this->postJson('/api/v1/auth/candidate', ['code' => 'MS77777777']);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Google Play Reviewer');
    }
}
