<?php

namespace Tests\Feature\Security;

use App\Models\Attempt;
use App\Models\Mock;
use App\Models\MockTest;
use App\Models\Test as ExamTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class VisibilityTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_student_search_never_returns_other_users_attempts(): void
    {
        $me = $this->student(['name' => 'Alice']);
        $other = $this->student(['name' => 'Bob Alice']);
        $test = ExamTest::factory()->create(['name' => 'Alice Test', 'is_public' => true]);
        Attempt::factory()->create(['user_id' => $me->id, 'test_id' => $test->id]);
        Attempt::factory()->create(['user_id' => $other->id, 'test_id' => $test->id]);

        $response = $this->actingAs($me)->getJson('/attempt?search=Alice');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame($me->id, $response->json('data.0.user_id'));
    }

    public function test_public_api_hides_private_tests_everywhere(): void
    {
        $private = ExamTest::factory()->create(['name' => 'Secret exam', 'description' => 'public text', 'is_public' => false]);
        $public = ExamTest::factory()->create(['name' => 'Open exam', 'is_public' => true]);

        $this->getJson('/api/v1/tests?search=Secret')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/tests?search=public')->assertOk()->assertJsonMissing(['name' => 'Secret exam']);
        $this->getJson("/api/v1/tests/{$private->id}")->assertNotFound();
        $this->getJson("/api/v1/tests/{$public->id}")->assertOk();
    }

    public function test_test_all_json_only_lists_visible_tests(): void
    {
        $student = $this->student();
        ExamTest::factory()->create(['name' => 'Hidden', 'is_public' => false]);
        $own = ExamTest::factory()->create(['name' => 'Mine', 'user_id' => $student->id, 'is_public' => false]);

        $names = collect($this->actingAs($student)->getJson('/test-all-json')->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Mine'));
        $this->assertFalse($names->contains('Hidden'));
    }

    public function test_per_page_is_clamped(): void
    {
        $this->assertSame(100, \App\Support\Pagination::perPage(request()->merge(['per_page' => 100000])));
        $this->assertSame(10, \App\Support\Pagination::perPage(request()->merge(['per_page' => -5])));
    }

    public function test_mock_page_is_restricted_to_owner_and_admin(): void
    {
        $owner = $this->teacher();
        $mock = Mock::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner)->get(route('mock.show', $mock))->assertOk();
        $this->actingAs($this->teacher())->get(route('mock.show', $mock))->assertForbidden();
        $this->actingAs($this->student())->get(route('mock.show', $mock))->assertForbidden();
    }

    public function test_welcome_page_does_not_leak_owner_contacts(): void
    {
        $owner = $this->teacher(['email' => 'secret@example.com', 'phone' => '998901112233']);
        $mock = Mock::factory()->create(['user_id' => $owner->id, 'open' => true]);

        $response = $this->get('/?slug=' . $mock->slug)->assertOk();
        $props = $response->viewData('page')['props'];

        $this->assertArrayNotHasKey('email', $props['mock']['user']);
        $this->assertArrayNotHasKey('phone', $props['mock']['user']);
        $this->assertStringNotContainsString('secret@example.com', json_encode($props));
    }

    public function test_mock_test_pivot_requires_ownership_and_visible_tests(): void
    {
        $owner = $this->teacher();
        $mock = Mock::factory()->create(['user_id' => $owner->id]);
        $foreignPrivate = ExamTest::factory()->create(['is_public' => false]);
        $public = ExamTest::factory()->create(['is_public' => true]);

        $this->actingAs($this->teacher())->post(route('mock-test.store'), ['mock_id' => $mock->id, 'testIds' => [$public->id]])->assertForbidden();
        $this->actingAs($owner)->post(route('mock-test.store'), ['mock_id' => $mock->id, 'testIds' => [$foreignPrivate->id]])->assertSessionHasErrors('testIds');

        $this->actingAs($owner)->post(route('mock-test.store'), ['mock_id' => $mock->id, 'testIds' => [$public->id, $public->id]]);
        $this->assertSame(1, MockTest::where('mock_id', $mock->id)->count());
    }

    public function test_candidate_codes_use_eight_digits(): void
    {
        $this->assertMatchesRegularExpression('/^MS\d{8}$/', \App\Models\MockStudent::generateUniqueCode());
    }
}
