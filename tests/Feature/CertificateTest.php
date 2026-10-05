<?php

namespace Tests\Feature;

use App\Models\Attempt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\LaravelPdf\Facades\Pdf;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    private function scoredAttempt(array $attrs = []): Attempt
    {
        $owner = $this->userWithRole('Student');

        return Attempt::factory()->create(array_merge([
            'user_id' => $owner->id,
            'score' => 52.0,
            'finished_at' => now(),
        ], $attrs));
    }

    public function test_owner_downloads_mock_result_pdf(): void
    {
        Pdf::fake();
        $attempt = $this->scoredAttempt();

        $this->actingAs($attempt->user)
            ->get(route('attempt.certificate', $attempt->id))
            ->assertOk();

        Pdf::assertRespondedWithPdf(function ($pdf) {
            $html = $pdf->getHtml();

            return str_contains($html, 'NATIJA HISOBOTI')
                && str_contains($html, 'davlat sertifikati emas')
                && ! str_contains($html, 'Valid until')
                && ! str_contains($html, 'qrserver');
        });
    }

    public function test_other_student_cannot_download(): void
    {
        Pdf::fake();
        $attempt = $this->scoredAttempt();
        $other = $this->userWithRole('Student');

        $this->actingAs($other)
            ->get(route('attempt.certificate', $attempt->id))
            ->assertForbidden();
    }

    public function test_unfinished_attempt_redirects_back_with_error(): void
    {
        Pdf::fake();
        $attempt = $this->scoredAttempt(['score' => null]);

        $this->actingAs($attempt->user)
            ->from('/dashboard')
            ->get(route('attempt.certificate', $attempt->id))
            ->assertRedirect('/dashboard')
            ->assertSessionHas('error');
    }

    public function test_verify_page_shows_disclaimer_without_official_wording(): void
    {
        $attempt = $this->scoredAttempt(['verify_code' => 'abc123verifycode']);

        $this->get(route('certificate.verify', 'abc123verifycode'))
            ->assertOk()
            ->assertSee('davlat sertifikati emas')
            ->assertDontSee('Rasmiy');
    }

    public function test_unknown_verify_code_is_404(): void
    {
        $this->get(route('certificate.verify', 'does-not-exist'))->assertNotFound();
    }
}
