<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Of Achievement - {{ $certNumber ?? 'MT' }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            -webkit-print-color-adjust: exact;
        }
        .certificate-container {
            width: 1040px;
            height: 720px;
            background: #ffffff;
            position: relative;
            border: 24px solid #4f46e5;
            padding: 40px;
            box-sizing: border-box;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .decorative-elements {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        }
        .circle-1 {
            position: absolute; top: -100px; right: -100px;
            width: 300px; height: 300px;
            background: #eef2ff; border-radius: 50%;
        }
        .circle-2 {
            position: absolute; bottom: -50px; left: -50px;
            width: 200px; height: 200px;
            background: #f1f5f9; border-radius: 50%;
        }
        .content {
            position: relative;
            z-index: 10;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        .brand-logo {
            font-size: 20px;
            font-weight: 900;
            color: #4f46e5;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .cert-code {
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            color: #64748b;
            background: #f1f5f9;
            padding: 4px 12px;
            border-radius: 6px;
        }
        .header h1 {
            margin: 10px 0 0;
            font-size: 44px;
            font-weight: 900;
            color: #1e1b4b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header p {
            font-size: 14px;
            font-weight: 700;
            color: #6366f1;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .present-text {
            margin-top: 15px;
            font-style: italic;
            font-size: 16px;
            color: #64748b;
        }
        .recipient-name {
            margin: 10px 0;
            font-size: 38px;
            font-weight: 800;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            display: inline-block;
            padding: 0 40px 5px;
        }
        .achievement-text {
            margin: 10px auto 20px;
            max-width: 650px;
            font-size: 15px;
            line-height: 1.5;
            color: #475569;
        }
        .stats-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 0 40px;
        }
        .stat-card {
            background: #f8fafc;
            padding: 12px 24px;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            min-width: 140px;
            text-align: center;
        }
        .stat-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .stat-value {
            font-size: 22px;
            font-weight: 900;
            color: #4f46e5;
        }
        .footer-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 40px;
            margin-top: 20px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            width: 160px;
            height: 1px;
            background: #94a3b8;
            margin-bottom: 6px;
        }
        .signature-text {
            font-size: 12px;
            font-weight: 700;
            color: #475569;
        }
        .qr-box {
            text-align: center;
        }
        .qr-img {
            width: 70px;
            height: 70px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: white;
            padding: 2px;
        }
        .qr-label {
            font-size: 8px;
            font-weight: bold;
            color: #94a3b8;
            text-transform: uppercase;
            margin-top: 2px;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="decorative-elements">
            <div class="circle-1"></div>
            <div class="circle-2"></div>
        </div>
        <div class="content">
            <div class="top-bar">
                <span class="brand-logo">MULTITEST</span>
                <span class="cert-code">{{ $certNumber ?? ('MT-' . str_pad($attempt->id, 6, '0', STR_PAD_LEFT)) }}</span>
            </div>

            <div class="header">
                <h1>Certificate</h1>
                <p>Of Achievement</p>
            </div>
            
            <p class="present-text">This certificate is proudly awarded to</p>
            <div class="recipient-name">
                {{ $attempt->mockStudent?->name ?? $attempt->user?->name ?? 'Candidate' }}
            </div>
            
            <p class="achievement-text">
                For successfully completing the <strong>{{ $attempt->mock?->name ?? $attempt->test?->name ?? 'Exam' }}</strong> 
                examination evaluated by our MultiTest assessment system.
            </p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Overall Score</div>
                    <div class="stat-value">{{ $attempt->final_score !== null ? number_format($attempt->final_score, 1) : '-' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">CEFR / Band</div>
                    <div class="stat-value">{{ $attempt->cefr_level ?? '-' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Issue Date</div>
                    <div class="stat-value" style="font-size: 15px; padding-top: 4px;">
                        {{ $attempt->evaluated_at?->format('d.m.Y') ?? $attempt->finished_at?->format('d.m.Y') ?? now()->format('d.m.Y') }}
                    </div>
                </div>
            </div>

            <div class="footer-info">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">Platform Director</div>
                </div>

                <div class="qr-box">
                    @if(isset($qrCodeUrl))
                        <img src="{{ $qrCodeUrl }}" alt="Verify QR Code" class="qr-img">
                    @else
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($verifyUrl) }}" alt="Verify QR Code" class="qr-img">
                    @endif
                    <div class="qr-label">Scan to verify</div>
                </div>

                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">AI Evaluation Board</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
