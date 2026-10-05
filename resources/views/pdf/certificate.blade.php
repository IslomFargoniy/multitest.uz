<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate Of Achievement - {{ $certNumber ?? 'MT' }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 8mm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }
        .cert-card {
            background: #ffffff;
            border: 6px solid #4f46e5;
            outline: 2px solid #c7d2fe;
            outline-offset: -4px;
            padding: 20px 32px;
            width: 100%;
        }
        .top-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #4f46e5;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .brand-sub {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 1.5px;
            margin-left: 6px;
            text-transform: uppercase;
        }
        .cert-badge {
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            color: #4338ca;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            padding: 4px 14px;
            border-radius: 6px;
        }
        .main-header {
            text-align: center;
            margin: 0 0 8px 0;
        }
        .main-header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 900;
            color: #1e1b4b;
            text-transform: uppercase;
            letter-spacing: 4px;
        }
        .main-header p {
            margin: 4px 0 0;
            font-size: 12px;
            font-weight: 700;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .presented-to {
            text-align: center;
            font-style: italic;
            font-size: 13px;
            color: #64748b;
            margin-top: 12px;
        }
        .candidate-name-box {
            text-align: center;
            margin: 6px 0 10px;
        }
        .candidate-name {
            display: inline-block;
            font-size: 30px;
            font-weight: 800;
            color: #1e293b;
            border-bottom: 2px solid #6366f1;
            padding: 0 35px 4px;
        }
        .desc-text {
            text-align: center;
            font-size: 13px;
            line-height: 1.4;
            color: #475569;
            max-width: 660px;
            margin: 0 auto 12px;
        }
        .stats-table {
            width: 78%;
            margin: 0 auto 14px;
            border-collapse: separate;
            border-spacing: 16px 0;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 16px;
            text-align: center;
            width: 33.33%;
        }
        .stat-card .label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 1px;
            margin-bottom: 3px;
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: 900;
            color: #4f46e5;
        }
        .stat-card .value-cefr {
            font-size: 24px;
            font-weight: 900;
            color: #059669;
        }
        .stat-card .value-date {
            font-size: 15px;
            font-weight: 800;
            color: #334155;
            padding-top: 6px;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        .sig-line {
            width: 150px;
            border-bottom: 1px solid #94a3b8;
            margin-bottom: 6px;
        }
        .sig-title {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
        }
        .qr-wrapper {
            text-align: center;
        }
        .qr-img {
            width: 66px;
            height: 66px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            padding: 2px;
            display: block;
            margin: 0 auto;
        }
        .qr-hint {
            font-size: 8px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            margin-top: 3px;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="cert-card">
        <table class="top-table">
            <tr>
                <td align="left" style="vertical-align: middle;">
                    <span class="brand-title">MULTITEST</span>
                    <span class="brand-sub">ASSESSMENT SYSTEM</span>
                </td>
                <td align="right" style="vertical-align: middle;">
                    <span class="cert-badge">{{ $certNumber ?? ('MT-' . str_pad($attempt->id, 6, '0', STR_PAD_LEFT)) }}</span>
                </td>
            </tr>
        </table>

        <div class="main-header">
            <h1>Certificate</h1>
            <p>Of Achievement</p>
        </div>

        <div class="presented-to">This certificate is proudly awarded to</div>
        
        <div class="candidate-name-box">
            <span class="candidate-name">
                {{ $attempt->mockStudent?->name ?? $attempt->user?->name ?? 'Candidate' }}
            </span>
        </div>

        <div class="desc-text">
            For successfully completing the <strong>{{ $attempt->mock?->name ?? $attempt->test?->name ?? 'Exam' }}</strong>
            examination evaluated by MultiTest assessment system.
        </div>

        <table class="stats-table">
            <tr>
                <td class="stat-card">
                    <div class="label">Overall Score</div>
                    <div class="value">{{ $attempt->final_score !== null ? number_format($attempt->final_score, 1) : '-' }}</div>
                </td>
                <td class="stat-card">
                    <div class="label">CEFR / Band</div>
                    <div class="value-cefr">{{ $attempt->cefr_level ?? '-' }}</div>
                </td>
                <td class="stat-card">
                    <div class="label">Issue Date</div>
                    <div class="value-date">
                        {{ $attempt->evaluated_at?->format('d.m.Y') ?? $attempt->finished_at?->format('d.m.Y') ?? now()->format('d.m.Y') }}
                    </div>
                </td>
            </tr>
        </table>

        <table class="footer-table">
            <tr>
                <td align="left" style="width: 33%; vertical-align: bottom;">
                    <div class="sig-line"></div>
                    <div class="sig-title">Platform Director</div>
                </td>
                <td align="center" style="width: 34%; vertical-align: middle;">
                    <div class="qr-wrapper">
                        @if(isset($qrCodeUrl) && !empty($qrCodeUrl))
                            <img src="{{ $qrCodeUrl }}" alt="QR Code" class="qr-img">
                        @elseif(isset($verifyUrl) && !empty($verifyUrl))
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($verifyUrl) }}" alt="QR Code" class="qr-img">
                        @endif
                        <div class="qr-hint">Scan to verify</div>
                    </div>
                </td>
                <td align="right" style="width: 33%; vertical-align: bottom;">
                    <div class="sig-line" style="margin-left: auto;"></div>
                    <div class="sig-title">AI Evaluation Board</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
