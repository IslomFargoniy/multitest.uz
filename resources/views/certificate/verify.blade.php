<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikatni Tekshirish - MultiTest</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800,900&display=swap" rel="stylesheet" />
    <style>
        body {
            font-family: 'Figtree', system-ui, sans-serif;
            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
            color: #1e293b;
        }
        .card {
            background: #ffffff;
            max-width: 480px;
            width: 100%;
            border-radius: 24px;
            box-shadow: 0 20px 40px -15px rgba(79, 70, 229, 0.15);
            border: 1px solid #e0e7ff;
            overflow: hidden;
            text-align: center;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            padding: 32px 24px;
            color: white;
        }
        .badge-icon {
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            font-size: 32px;
        }
        .title {
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .status-badge {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 14px;
            border-radius: 9999px;
            background: #10b981;
            color: white;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .body-content {
            padding: 28px 24px;
        }
        .info-group {
            margin-bottom: 20px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 16px;
        }
        .label {
            font-size: 11px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .value {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
        }
        .score-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 20px;
            border-radius: 16px;
            background: #eef2ff;
            color: #4f46e5;
            font-size: 24px;
            font-weight: 900;
            margin: 8px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 16px;
            border-top: 1px solid #f1f5f9;
            font-size: 12px;
            color: #64748b;
        }
        .btn-download {
            display: inline-block;
            margin-top: 12px;
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 700;
            font-size: 13px;
            transition: 0.2s;
        }
        .btn-download:hover {
            background: #4338ca;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="badge-icon">✓</div>
            <h1 class="title">Haqiqiy Sertifikat</h1>
            <div class="status-badge">Rasmiy Tasdiqlangan</div>
        </div>

        <div class="body-content">
            <div class="info-group">
                <div class="label">Sertifikat Raqami</div>
                <div class="value" style="font-family: monospace; color: #4f46e5;">{{ $certNumber }}</div>
            </div>

            <div class="info-group">
                <div class="label">Nomzod / Talaba</div>
                <div class="value">{{ $candidateName }}</div>
            </div>

            <div class="info-group">
                <div class="label">Imtihon Nomi</div>
                <div class="value" style="font-size: 16px;">{{ $testName }}</div>
            </div>

            <div class="info-group" style="border-bottom: none; margin-bottom: 0;">
                <div class="label">Imtihon Natijasi</div>
                <div class="score-pill">
                    ★ {{ is_numeric($score) ? number_format($score, 1) : $score }}@if($level) · {{ $level }}@endif
                </div>
            </div>

            @if(auth()->check() || session('mock_student_id'))
                <a href="{{ route('attempt.certificate', $attempt->id) }}" class="btn-download">
                    📥 PDF Sertifikatni Yuklab Olish
                </a>
            @endif
        </div>

        <div class="footer">
            MultiTest AI Assessment System • {{ now()->format('Y') }}
        </div>
    </div>
</body>
</html>
