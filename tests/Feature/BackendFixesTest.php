<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Language;
use App\Models\Mock;
use App\Models\MockStudent;
use App\Models\Question;
use App\Models\Test as ExamTest;
use App\Models\User\User;
use App\Services\Telegram\MultitestUzBotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class BackendFixesTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_deleting_a_mock_keeps_candidates_and_attempts(): void
    {
        $teacher = $this->teacher();
        $mock = Mock::factory()->create(['user_id' => $teacher->id]);
        $student = MockStudent::factory()->create(['mock_id' => $mock->id]);
        $attempt = Attempt::factory()->create(['mock_id' => $mock->id, 'mock_student_id' => $student->id, 'user_id' => null]);

        $this->actingAs($teacher)->delete(route('mock.destroy', $mock))->assertRedirect();

        $this->assertSoftDeleted('mocks', ['id' => $mock->id]);
        $this->assertDatabaseHas('mock_students', ['id' => $student->id]);
        $this->assertSame($mock->id, $attempt->fresh()->mock_id);
    }

    public function test_soft_deleting_attempt_keeps_parts_and_answers(): void
    {
        $student = $this->student();
        $attempt = Attempt::factory()->create(['user_id' => $student->id]);
        $part = AttemptPart::factory()->create(['attempt_id' => $attempt->id]);
        $answer = AttemptAnswer::factory()->create(['attempt_part_id' => $part->id]);

        $this->actingAs($student)->delete(route('attempt.destroy', $attempt))->assertRedirect();

        $this->assertSoftDeleted('attempts', ['id' => $attempt->id]);
        $this->assertDatabaseHas('attempt_parts', ['id' => $part->id]);
        $this->assertDatabaseHas('attempt_answers', ['id' => $answer->id]);
    }

    public function test_deleting_an_answer_removes_its_audio_file(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('attempt_answers_audio/a.mp3', 'x');
        $answer = new AttemptAnswer(['audio_path' => '/storage/attempt_answers_audio/a.mp3']);
        $answer->attempt_part_id = AttemptPart::factory()->create()->id;
        $answer->question_id = Question::factory()->create()->id;
        $answer->started_at = now();
        $answer->saveQuietly();

        $answer->delete();

        Storage::disk('public')->assertMissing('attempt_answers_audio/a.mp3');
    }

    public function test_test_creation_works_without_authenticated_context(): void
    {
        // Observers also run from queue/console, where there is no Auth::user().
        $test = ExamTest::factory()->create();

        $this->assertSame(4, $test->parts()->count());
        $this->assertStringStartsWith('/', $test->parts()->first()->audio_path);
    }

    public function test_student_without_limit_cannot_create_tests_but_limit_enables_it(): void
    {
        $language = Language::factory()->create();
        $student = $this->student();

        $this->actingAs($student)->post(route('test.store'), ['language_id' => $language->id, 'name' => 'T'])->assertForbidden();

        $student->update(['create_test_limit' => 1]);
        $this->actingAs($student->fresh())->post(route('test.store'), ['language_id' => $language->id, 'name' => 'T'])->assertRedirect();
        $this->assertSame(1, ExamTest::where('user_id', $student->id)->count());
    }

    public function test_locale_is_applied_from_session_and_shared_only_when_chosen(): void
    {
        $user = $this->student();

        $page = $this->actingAs($user)->get('/dashboard')->viewData('page');
        $this->assertNull($page['props']['locale']);

        $this->actingAs($user)->get('/lang/uz');
        $page = $this->actingAs($user)->get('/dashboard')->viewData('page');
        $this->assertSame('uz', $page['props']['locale']);
        $this->assertSame('uz', app()->getLocale());
    }

    public function test_flash_messages_are_shared_with_inertia(): void
    {
        $user = $this->student();

        $page = $this->actingAs($user)->withSession(['success' => 'Saved'])->get('/dashboard')->viewData('page');

        $this->assertSame('Saved', $page['props']['flash']['success']);
    }

    public function test_bot_keeps_original_referrer_and_profile(): void
    {
        config(['services.telegram.bot_token' => '1:T']);
        $this->seedRoles();
        $service = new class extends MultitestUzBotService
        {
            public function make($chatId, $from, $ref = null): User
            {
                return $this->getOrCreateUser($chatId, $from, $ref);
            }
        };

        $first = $service->make(555, ['first_name' => 'Ali', 'username' => 'ali'], '111');
        $first->update(['name' => 'Ali Renamed']);
        $again = $service->make(555, ['first_name' => 'Telegram Name'], '222');

        $this->assertSame('111', $again->ref_telegram_id);
        $this->assertSame('Ali Renamed', $again->name);
        $this->assertTrue($again->hasRole('Student'));
    }

    public function test_sitemap_lists_only_public_pages(): void
    {
        ExamTest::factory()->create(['is_public' => true]);

        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();

        $this->assertStringNotContainsString('/test', $xml);
        $this->assertStringContainsString('/login', $xml);
    }

    public function test_unknown_pages_return_404_instead_of_redirecting(): void
    {
        $this->get('/definitely-not-a-page')->assertNotFound();
    }

    public function test_evaluate_returns_redirect_and_stores_integer_score(): void
    {
        $teacher = $this->teacher();
        $test = ExamTest::factory()->create(['user_id' => $teacher->id]);
        $attempt = Attempt::factory()->create(['test_id' => $test->id]);

        $this->actingAs($teacher)->post(route('attempt.evaluate', $attempt), ['score' => 60.5])->assertSessionHasErrors('score');
        $this->actingAs($teacher)->post(route('attempt.evaluate', $attempt), ['score' => 60, 'review' => 'ok'])->assertRedirect();

        $this->assertSame(60, $attempt->fresh()->score);
        $this->assertNotNull($attempt->fresh()->evaluated_at);
    }
}
