<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>MultiTest Ilovasini ochish</title>
    <script>
        setTimeout(function () {
            window.location.href = @json($schemeUrl);
        }, 100);
    </script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0b0f19; color: #fff; text-align: center; padding: 24px; box-sizing: border-box; }
        .card { background: #1e293b; padding: 32px 24px; border-radius: 20px; max-width: 360px; width: 100%; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,.5); }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 20px; box-shadow: 0 4px 15px rgba(99,102,241,.4); }
        .code { font-family: monospace; font-size: 24px; letter-spacing: 4px; color: #818cf8; background: #0f172a; padding: 10px 20px; border-radius: 10px; display: inline-block; margin-top: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="margin-top:0;">📱 MultiTest Ilovasi</h2>
        <p style="color:#94a3b8; font-size:14px; margin-bottom: 8px;">Ilova avtomatik ochilmasa, quyidagi tugmani bosing:</p>
        <div class="code">{{ $otp }}</div>
        <div>
            <a href="{{ $schemeUrl }}" class="btn">Ilovada ochish</a>
        </div>
    </div>
</body>
</html>
