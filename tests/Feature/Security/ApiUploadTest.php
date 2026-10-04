<?php

namespace Tests\Feature\Security;

use App\Models\Attempt;
use App\Models\AttemptPart;
use App\Models\Question;
use App\Models\Test as ExamTest;
use App\Support\ClientTime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class ApiUploadTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private function scenario($user): array
    {
        $test = ExamTest::factory()->create(['is_public' => true]);
        $part = $test->parts()->first();
        $question = Question::factory()->create(['part_id' => $part->id]);
        $attempt = Attempt::factory()->create(['user_id' => $user->id, 'test_id' => $test->id]);
        $attemptPart = AttemptPart::factory()->create(['attempt_id' => $attempt->id, 'part_id' => $part->id]);

        return [$attemptPart, $question];
    }

    public function test_valid_audio_is_stored_with_generated_name(): void
    {
        Storage::fake('public');
        $user = $this->student();
        Sanctum::actingAs($user);
        [$attemptPart, $question] = $this->scenario($user);

        $this->post("/api/v1/attempts/{$attemptPart->id}/upload-answers", [
            'answers' => json_encode([['question_id' => $question->id]]),
            "audio_{$question->id}" => UploadedFile::fake()->create('client-name.m4a', 20, 'audio/mp4'),
        ], ['Accept' => 'application/json'])->assertOk();

        $path = $attemptPart->attempt_answers()->firstOrFail()->audio_path;
        $this->assertStringEndsWith('.m4a', $path);
        $this->assertStringNotContainsString('client-name', $path);
    }

    public function test_html_upload_is_rejected(): void
    {
        $user = $this->student();
        Sanctum::actingAs($user);
        [$attemptPart, $question] = $this->scenario($user);

        $this->post("/api/v1/attempts/{$attemptPart->id}/upload-answers", [
            'answers' => json_encode([['question_id' => $question->id]]),
            "audio_{$question->id}" => UploadedFile::fake()->create('x.html', 5, 'text/html'),
        ], ['Accept' => 'application/json'])->assertStatus(422);

        $this->assertDatabaseCount('attempt_answers', 0);
    }

    public function test_question_from_other_part_is_rejected(): void
    {
        $user = $this->student();
        Sanctum::actingAs($user);
        [$attemptPart] = $this->scenario($user);
        $foreign = Question::factory()->create();

        $this->post("/api/v1/attempts/{$attemptPart->id}/upload-answers", [
            'answers' => json_encode([['question_id' => $foreign->id]]),
        ], ['Accept' => 'application/json'])->assertStatus(422);
    }

    public function test_other_users_attempt_part_is_forbidden(): void
    {
        $owner = $this->student();
        [$attemptPart, $question] = $this->scenario($owner);
        Sanctum::actingAs($this->student());

        $this->post("/api/v1/attempts/{$attemptPart->id}/upload-answers", [
            'answers' => json_encode([['question_id' => $question->id]]),
        ], ['Accept' => 'application/json'])->assertForbidden();
    }

    public function test_avatar_upload_works_and_svg_is_rejected(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($user = $this->student());

        $this->post('/api/v1/user/update', ['avatar' => UploadedFile::fake()->image('me.png')], ['Accept' => 'application/json'])->assertOk();
        $this->assertStringEndsWith('.png', $user->fresh()->avatar);

        $this->post('/api/v1/user/update', ['avatar' => UploadedFile::fake()->create('x.svg', 1, 'image/svg+xml')], ['Accept' => 'application/json'])->assertStatus(422);
    }

    public function test_client_iso_timestamps_are_converted_to_app_timezone(): void
    {
        Storage::fake('public');
        $user = $this->student();
        Sanctum::actingAs($user);
        [$attemptPart, $question] = $this->scenario($user);

        $this->post("/api/v1/attempts/{$attemptPart->id}/upload-answers", [
            'answers' => json_encode([['question_id' => $question->id, 'started_at' => '2026-10-05T10:00:00Z', 'finished_at' => '2026-10-05T10:00:30Z']]),
        ], ['Accept' => 'application/json'])->assertOk();

        $answer = $attemptPart->attempt_answers()->firstOrFail();
        // 10:00 UTC is 15:00 in Asia/Tashkent (UTC+5)
        $this->assertSame('2026-10-05 15:00:00', $answer->started_at->format('Y-m-d H:i:s'));
        $this->assertEquals(30, $answer->started_at->diffInSeconds($answer->finished_at));
    }

    public function test_garbage_timestamps_fall_back_to_now(): void
    {
        $this->assertTrue(ClientTime::parse('not a date')->diffInSeconds(now()) < 5);
        $this->assertTrue(ClientTime::parse(null)->diffInSeconds(now()) < 5);
    }
}
