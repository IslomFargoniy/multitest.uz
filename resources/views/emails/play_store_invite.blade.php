<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? "MultiTest ilovasi Google Play'da — Sinovchi bo'ling!" }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08); border:1px solid #e2e8f0;">
                    
                    {{-- Header with MultiTest Brand --}}
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding:36px 32px; text-align:center;">
                            <div style="display:inline-block; margin-bottom:12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                                    <tr>
                                        <td style="background:linear-gradient(135deg, #4f46e5, #06b6d4); width:48px; height:48px; border-radius:14px; text-align:center; vertical-align:middle; color:#ffffff; font-size:24px; font-weight:900;">
                                            M
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.02em;">
                                MultiTest.uz
                            </h1>
                            <p style="margin:6px 0 0; color:#94a3b8; font-size:13px; font-weight:500;">
                                Rasmiy Android ilovasi Google Play'da
                            </p>
                        </td>
                    </tr>

                    {{-- Body Content --}}
                    <tr>
                        <td style="padding:32px 28px;">
                            <p style="margin:0 0 16px; color:#1e293b; font-size:17px; font-weight:700;">
                                Assalomu alaykum{{ !empty($user->name) ? ', ' . $user->name : '' }}! 👋
                            </p>

                            <p style="margin:0 0 20px; color:#475569; font-size:15px; line-height:1.65;">
                                {!! nl2br(e($customMessage ?? "MultiTest rasmiy mobil ilovasi Android uchun Google Play Store'da e'lon qilindi! Biz sizni eng birinchi rasmiy sinovchilarimiz (Closed Beta Testers) safida ko'rishdan mamnunmiz.")) !!}
                            </p>

                            {{-- Steps Box --}}
                            <div style="background-color:#f8fafc; border-radius:18px; border:1px solid #e2e8f0; padding:22px; margin:24px 0;">
                                <p style="margin:0 0 14px; color:#0f172a; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">
                                    🚀 Sinovchi bo'lish uchun 3 ta qadam:
                                </p>

                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                                    <tr>
                                        <td style="width:28px; vertical-align:top;">
                                            <span style="background:#4f46e5; color:#ffffff; font-size:12px; font-weight:bold; border-radius:50%; display:inline-block; width:22px; height:22px; text-align:center; line-height:22px;">1</span>
                                        </td>
                                        <td style="color:#334155; font-size:14px; line-height:1.5;">
                                            Pastdagi <strong>«Google Play'da Sinovchi Bo'lish»</strong> tugmasini bosing.
                                        </td>
                                    </tr>
                                </table>

                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                                    <tr>
                                        <td style="width:28px; vertical-align:top;">
                                            <span style="background:#4f46e5; color:#ffffff; font-size:12px; font-weight:bold; border-radius:50%; display:inline-block; width:22px; height:22px; text-align:center; line-height:22px;">2</span>
                                        </td>
                                        <td style="color:#334155; font-size:14px; line-height:1.5;">
                                            Ochilgan sahifada ko'k <strong>«Become a tester»</strong> (Tester bo'lish) tugmasini bosing.
                                        </td>
                                    </tr>
                                </table>

                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="width:28px; vertical-align:top;">
                                            <span style="background:#4f46e5; color:#ffffff; font-size:12px; font-weight:bold; border-radius:50%; display:inline-block; width:22px; height:22px; text-align:center; line-height:22px;">3</span>
                                        </td>
                                        <td style="color:#334155; font-size:14px; line-height:1.5;">
                                            <strong>«Download it on Google Play»</strong> havolasi orqali ilovani telefoningizga o'rnating.
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            {{-- CTA Button --}}
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 16px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $testingUrl }}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color:#ffffff; font-size:16px; font-weight:700; text-decoration:none; padding:15px 32px; border-radius:14px; box-shadow:0 6px 18px rgba(79,70,229,0.35); letter-spacing:-0.01em;">
                                            📲 Google Play'da Sinovchi Bo'lish &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            {{-- Important Notice --}}
                            <div style="background-color:#eff6ff; border-left:4px solid #3b82f6; border-radius:8px; padding:12px 16px; margin:24px 0 12px;">
                                <p style="margin:0; color:#1e40af; font-size:13px; line-height:1.5;">
                                    💡 <strong>Muhim:</strong> Havolani aynan ushbu xat kelgan Google (Gmail) pochtangiz (<code>{{ $user->email }}</code>) orqali oching. Aks holda Google Play ilovani ko'rsatmasligi mumkin.
                                </p>
                            </div>

                            <p style="margin:24px 0 0; color:#64748b; font-size:14px; line-height:1.6;">
                                Sinovda ishtirok etayotganingiz va ilovani rivojlantirishga qo'shayotgan hissangiz uchun katta rahmat! 🤝
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:24px; text-align:center;">
                            <p style="margin:0 0 6px; color:#64748b; font-size:12px;">
                                Ushbu xat siz MultiTest.uz platformasida ro'yxatdan o'tganingiz sababli yuborildi.
                            </p>
                            <p style="margin:0; color:#94a3b8; font-size:12px;">
                                © {{ date('Y') }} MultiTest.uz. Barcha huquqlar himoyalangan.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
