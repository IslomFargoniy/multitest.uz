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

        $rawName = $attempt->mockStudent?->name ?? $attempt->user?->name ?? '';
        $cleanName = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $rawName);
        $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));

        if (empty($cleanName)) {
            $rawUsername = $attempt->user?->username ?? '';
            $cleanUsername = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $rawUsername);
            $cleanName = !empty(trim($cleanUsername)) ? trim($cleanUsername) : ('NOMZOD #' . $attempt->id);
        }

        $nameParts = array_values(array_filter(explode(' ', $cleanName)));
        if (count($nameParts) >= 3) {
            $surname = mb_strtoupper($nameParts[0], 'UTF-8');
            $firstName = mb_strtoupper($nameParts[1], 'UTF-8');
            $patronymic = mb_strtoupper(implode(' ', array_slice($nameParts, 2)), 'UTF-8');
        } elseif (count($nameParts) === 2) {
            $surname = mb_strtoupper($nameParts[0], 'UTF-8');
            $firstName = mb_strtoupper($nameParts[1], 'UTF-8');
            $patronymic = '-';
        } else {
            $surname = mb_strtoupper($cleanName, 'UTF-8');
            $firstName = '-';
            $patronymic = '-';
        }

        // Sub-scores mapping
        $attempt->loadMissing('attempt_parts.part');
        $scores = [
            'listening' => null,
            'reading' => null,
            'writing' => null,
            'speaking' => null,
        ];

        foreach ($attempt->attempt_parts as $ap) {
            $pName = mb_strtolower($ap->part?->name ?? '', 'UTF-8');
            if (str_contains($pName, 'listen') || str_contains($pName, 'tinglab')) {
                $scores['listening'] = $ap->score;
            } elseif (str_contains($pName, 'read') || str_contains($pName, 'o\'qish') || str_contains($pName, 'oqish')) {
                $scores['reading'] = $ap->score;
            } elseif (str_contains($pName, 'writ') || str_contains($pName, 'yozish')) {
                $scores['writing'] = $ap->score;
            } elseif (str_contains($pName, 'speak') || str_contains($pName, 'gapirish')) {
                $scores['speaking'] = $ap->score;
            }
        }

        if ($scores['speaking'] === null && $attempt->final_score !== null) {
            $scores['speaking'] = round($attempt->final_score);
        }

        $issueDateObj = $attempt->evaluated_at ?? $attempt->finished_at ?? $attempt->created_at ?? now();
        $issueDate = $issueDateObj->format('d.m.Y');
        $validUntil = $issueDateObj->copy()->addYears(2)->subDay()->format('d.m.Y');

        $certNumber = '26BBA' . str_pad($attempt->id, 7, '0', STR_PAD_LEFT) . 'OB';
        $idSeriesNumber = $attempt->mockStudent?->code ?? ('MT ' . str_pad($attempt->id, 7, '0', STR_PAD_LEFT));

        return Pdf::view('pdf.certificate', [
            'attempt' => $attempt,
            'qrCodeUrl' => $qrCodeDataUri,
            'verifyUrl' => $verifyUrl,
            'certNumber' => $certNumber,
            'idSeriesNumber' => $idSeriesNumber,
            'surname' => $surname,
            'firstName' => $firstName,
            'patronymic' => $patronymic,
            'scores' => $scores,
            'overallScore' => $attempt->final_score !== null ? (floor($attempt->final_score) == $attempt->final_score ? (int) $attempt->final_score : number_format($attempt->final_score, 1)) : '-',
            'cefrLevel' => $attempt->cefr_level ?? ($attempt->final_score >= 65 ? 'C1' : ($attempt->final_score >= 51 ? 'B2' : ($attempt->final_score >= 38 ? 'B1' : 'Below B1'))),
            'issueDate' => $issueDate,
            'validUntil' => $validUntil,
        ])
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

        $rawCandidateName = $attempt->mockStudent?->name ?? $attempt->user?->name ?? '';
        $cleanCandidateName = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $rawCandidateName);
        $cleanCandidateName = trim(preg_replace('/\s+/', ' ', $cleanCandidateName));
        if (empty($cleanCandidateName)) {
            $rawUsername = $attempt->user?->username ?? '';
            $cleanUsername = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $rawUsername);
            $cleanCandidateName = !empty(trim($cleanUsername)) ? trim($cleanUsername) : ('Nomzod #' . $attempt->id);
        }

        return view('certificate.verify', [
            'attempt' => $attempt,
            'candidateName' => $cleanCandidateName,
            'testName' => $attempt->mock?->name ?? $attempt->test?->name ?? 'Imtihon',
            'score' => $score ?? 'Hali baholanmagan',
            'level' => $attempt->cefr_level,
            'certNumber' => '26BBA' . str_pad($attempt->id, 7, '0', STR_PAD_LEFT) . 'OB',
            'issueDate' => $attempt->evaluated_at ?? $attempt->finished_at ?? $attempt->created_at,
        ]);
    }
}
