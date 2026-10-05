<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use chillerlan\QRCode\Output\QRGdImagePNG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\LaravelPdf\Facades\Pdf;

class CertificateController extends Controller
{
    public function download(int $attempt)
    {
        $attempt = Attempt::query()
            ->select('attempts.*')
            ->withAiScoreAvg()
            ->with(['user', 'mock', 'mockStudent', 'test'])
            ->findOrFail($attempt);

        // Security check: allow owner, the candidate in session, or an admin / the teacher who owns the exam
        $candidateStudentId = session('mock_student_id');
        $isCandidate = $candidateStudentId && $attempt->mock_student_id && (int) $candidateStudentId === (int) $attempt->mock_student_id;

        if (!$isCandidate) {
            abort_unless(auth()->check() && auth()->user()->can('view', $attempt), 403, 'Ruxsat berilmagan.');
        }

        if ($attempt->final_score === null) {
            return back()->with('error', 'Natijalar hali tayyor emas.');
        }

        if (empty($attempt->verify_code)) {
            $attempt->verify_code = Str::lower(Str::random(32));
            $attempt->saveQuietly();
        }

        $verifyUrl = route('certificate.verify', $attempt->verify_code);

        try {
            $qrOptions = new QROptions([
                'outputInterface' => QRGdImagePNG::class,
                'imageBase64' => true,
                'scale' => 6,
            ]);
            $qrCodeDataUri = (new QRCode($qrOptions))->render($verifyUrl);
        } catch (\Throwable $e) {
            Log::warning('Local QR code generation failed, fallback to external API: ' . $e->getMessage());
            $qrCodeDataUri = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($verifyUrl);
        }

        return Pdf::view('pdf.certificate', [
            'attempt' => $attempt,
            'qrCodeUrl' => $qrCodeDataUri,
            'verifyUrl' => $verifyUrl,
            'certNumber' => 'MT-' . str_pad($attempt->id, 6, '0', STR_PAD_LEFT),
        ])
            ->landscape()
            ->name("certificate-{$attempt->id}.pdf")
            ->download();
    }

    public function verify(string $code)
    {
        $attempt = Attempt::query()
            ->select('attempts.*')
            ->withAiScoreAvg()
            ->with(['user:id,name', 'mock:id,name', 'mockStudent:id,name', 'test:id,name'])
            ->where('verify_code', $code)
            ->firstOrFail();

        $score = $attempt->final_score;

        return view('certificate.verify', [
            'attempt' => $attempt,
            'candidateName' => $attempt->mockStudent?->name ?? $attempt->user?->name ?? 'Nomzod',
            'testName' => $attempt->mock?->name ?? $attempt->test?->name ?? 'Imtihon',
            'score' => $score ?? 'Hali baholanmagan',
            'level' => $attempt->cefr_level,
            'certNumber' => 'MT-' . str_pad($attempt->id, 6, '0', STR_PAD_LEFT),
            'issueDate' => $attempt->evaluated_at ?? $attempt->finished_at ?? $attempt->created_at,
        ]);
    }
}
