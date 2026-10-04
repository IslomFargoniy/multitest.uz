<?php

namespace Tests\Feature\Security;

use App\Models\Attempt;
use App\Models\Test as ExamTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_verify_uses_random_code_not_sequential_id(): void
    {
        $attempt = Attempt::factory()->create(['score' => 70, 'user_id' => $this->student()->id]);

        $this->assertSame(32, strlen($attempt->verify_code));
        $this->get('/certificate/verify/' . $attempt->id)->assertNotFound();
        $this->get('/certificate/verify/' . $attempt->verify_code)->assertOk()->assertSee('C1');
    }

    public function test_unevaluated_attempt_is_not_shown_as_zero(): void
    {
        $attempt = Attempt::factory()->create(['user_id' => $this->student()->id]);

        $this->get('/certificate/verify/' . $attempt->verify_code)->assertOk()->assertSee('Hali baholanmagan');
    }

    public function test_verify_code_is_not_serialized(): void
    {
        $attempt = Attempt::factory()->create();

        $this->assertArrayNotHasKey('verify_code', $attempt->toArray());
    }

    public function test_download_is_forbidden_for_other_students_and_foreign_teachers(): void
    {
        $owner = $this->student();
        $attempt = Attempt::factory()->create(['user_id' => $owner->id, 'score' => 60]);

        $this->actingAs($this->student())->get(route('attempt.certificate', $attempt))->assertForbidden();
        $this->actingAs($this->teacher())->get(route('attempt.certificate', $attempt))->assertForbidden();
    }

    public function test_cefr_levels_follow_uzbmb_thresholds(): void
    {
        foreach ([[75, 'C1'], [65, 'C1'], [64, 'B2'], [51, 'B2'], [50, 'B1'], [38, 'B1'], [37, 'Below B1']] as [$score, $level]) {
            $this->assertSame($level, (new Attempt(['score' => $score]))->cefr_level, "score $score");
        }
    }
}
