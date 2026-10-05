<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>Certificate - {{ $certNumber ?? 'MultiTest' }}</title>
<style>
    @page {
        size: A4 portrait;
        margin: 7mm 9mm 7mm 9mm;
    }
    * {
        box-sizing: border-box;
    }
    body {
        font-family: 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
        color: #111111;
        margin: 0;
        padding: 0;
        font-size: 8pt;
        line-height: 1.25;
        background-color: #ffffff;
    }
    /* MultiTest Official Frame */
    .cert-frame-outer {
        background-color: #fffdfa;
        border: 4px double #0284c7;
        padding: 4px;
    }
    .cert-frame-middle {
        border: 1px solid #0369a1;
        padding: 4px;
    }
    .cert-frame-inner {
        border: 1px solid #111111;
        padding: 18px 24px 18px 24px;
    }

    /* MultiTest Brand Header */
    .header-table {
        width: 100%;
        border-collapse: collapse;
    }
    .header-left {
        width: 42%;
        text-align: center;
        font-size: 7.2pt;
        font-weight: bold;
        line-height: 1.35;
        text-transform: uppercase;
        vertical-align: middle;
        color: #0369a1;
    }
    .header-crest {
        width: 16%;
        text-align: center;
        vertical-align: middle;
    }
    .header-right {
        width: 42%;
        text-align: center;
        font-size: 7.2pt;
        font-weight: bold;
        line-height: 1.35;
        text-transform: uppercase;
        vertical-align: middle;
        color: #0369a1;
    }
    .crest-seal {
        width: 62px;
        height: 62px;
        margin: 0 auto;
        display: block;
    }

    .divider-line {
        border-top: 1px solid #0284c7;
        margin: 10px 0;
        opacity: 0.8;
    }

    /* Titles */
    .title-section {
        text-align: center;
        margin: 10px 0 12px 0;
    }
    .title-sub-top {
        font-size: 8.5pt;
        font-weight: bold;
        color: #0369a1;
        letter-spacing: 1.5px;
        margin-bottom: 5px;
        text-transform: uppercase;
    }
    .title-main {
        font-size: 30pt;
        font-weight: bold;
        color: #0369a1;
        letter-spacing: 2.5px;
        line-height: 1.1;
        margin: 0;
        font-family: 'DejaVu Serif', 'Times New Roman', serif;
    }
    .title-sub-bot {
        font-size: 8.5pt;
        font-weight: bold;
        color: #0369a1;
        letter-spacing: 1.5px;
        margin-top: 5px;
        text-transform: uppercase;
    }

    /* Reference Number Row */
    .ref-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
    }
    .ref-label {
        font-size: 8.5pt;
        font-weight: bold;
        vertical-align: middle;
        color: #111111;
    }
    .ref-box-wrap {
        text-align: right;
        vertical-align: middle;
    }
    .bordered-box {
        display: inline-block;
        border: 1px solid #111111;
        padding: 4px 18px;
        font-weight: bold;
        font-size: 9.5pt;
        background: #ffffff;
        letter-spacing: 1px;
    }

    /* Candidate Details Section */
    .section-title {
        font-size: 8.5pt;
        font-weight: bold;
        margin-bottom: 10px;
        color: #111111;
    }
    .details-table {
        width: 100%;
        border-collapse: collapse;
    }
    .details-fields {
        width: 76%;
        vertical-align: top;
    }
    .field-row {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
    }
    .field-label {
        width: 58%;
        font-size: 8pt;
        line-height: 1.25;
        color: #222222;
        padding-right: 8px;
    }
    .field-value {
        width: 42%;
        font-size: 9.5pt;
        font-weight: bold;
        text-transform: uppercase;
        color: #000000;
    }
    .details-photo {
        width: 24%;
        text-align: right;
        vertical-align: top;
    }
    .photo-box {
        width: 95px;
        height: 125px;
        border: 1px solid #333333;
        display: inline-block;
        background: #f8fafc;
        text-align: center;
        vertical-align: middle;
        overflow: hidden;
    }

    /* Language & Level Row */
    .results-row1 {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 14px 0;
    }

    /* Skills Grid */
    .skills-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 6px;
    }
    .skill-td-left {
        width: 40%;
        vertical-align: middle;
        padding: 5px 0;
    }
    .skill-td-mid {
        width: 32%;
        vertical-align: middle;
        padding: 5px 0;
    }
    .skill-td-right {
        width: 28%;
        vertical-align: middle;
        text-align: right;
        padding: 5px 0;
    }
    .skill-label-text {
        font-size: 8pt;
        color: #222222;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
    }
    .score-box {
        display: inline-block;
        border: 1px solid #111111;
        width: 48px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        font-weight: bold;
        font-size: 9.5pt;
        background: #ffffff;
        vertical-align: middle;
    }

    /* Dates */
    .dates-table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0 14px 0;
    }

    /* Bottom Signatures & QR */
    .bottom-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }
    .director-label {
        font-size: 8.5pt;
        font-weight: bold;
        line-height: 1.35;
        color: #1e293b;
    }
    .director-name {
        font-size: 9.5pt;
        font-weight: bold;
        text-align: right;
        text-transform: uppercase;
        color: #0369a1;
    }
    .qr-center {
        text-align: center;
    }
    .qr-img {
        width: 90px;
        height: 90px;
        display: block;
        margin: 0 auto;
    }

    .footer-note {
        text-align: center;
        font-size: 7.5pt;
        color: #4b5563;
        margin-top: 14px;
    }
</style>
</head>
<body>
<div class="cert-frame-outer">
    <div class="cert-frame-middle">
        <div class="cert-frame-inner">
            <!-- MultiTest Header -->
            <table class="header-table">
                <tr>
                    <td class="header-left">
                        MULTITEST BAHOLASH TIZIMI<br>
                        ONLINE CEFR VA TIL KO'NIKMALARI<br>
                        BAHOLASH VA TESTLASH<br>
                        PLATFORMASI
                    </td>
                    <td class="header-crest">
                        @if(isset($logoBase64) && !empty($logoBase64))
                            <img src="{{ $logoBase64 }}" class="crest-seal" alt="MultiTest Logo">
                        @else
                            <img src="{{ public_path('images/logo/logo-no-bg.png') }}" class="crest-seal" alt="MultiTest Logo">
                        @endif
                    </td>
                    <td class="header-right">
                        MULTITEST ASSESSMENT SYSTEM<br>
                        ONLINE CEFR & LANGUAGE SKILLS<br>
                        EVALUATION AND TESTING<br>
                        PLATFORM
                    </td>
                </tr>
            </table>

            <div class="divider-line"></div>

            <!-- Title -->
            <div class="title-section">
                <div class="title-sub-top">TIL BILISH DARAJASI BO'YICHA</div>
                <div class="title-main">SERTIFIKAT</div>
                <div class="title-main">CERTIFICATE</div>
                <div class="title-sub-bot">OF LANGUAGE PROFICIENCY</div>
            </div>

            <!-- Ref Number -->
            <table class="ref-table">
                <tr>
                    <td class="ref-label">Sertifikat № | Reference Number</td>
                    <td class="ref-box-wrap">
                        <span class="bordered-box">{{ $certNumber ?? ('MT-' . str_pad($attempt->id, 6, '0', STR_PAD_LEFT)) }}</span>
                    </td>
                </tr>
            </table>

            <div class="divider-line"></div>

            <!-- Candidate Details -->
            <div class="section-title">Talabgor to'g'risidagi ma'lumot | Candidate Details</div>
            <table class="details-table">
                <tr>
                    <td class="details-fields">
                        <table class="field-row">
                            <tr>
                                <td class="field-label">Nomzod ID raqami | Candidate ID:</td>
                                <td class="field-value">{{ $idSeriesNumber ?? ('MT-' . $attempt->id) }}</td>
                            </tr>
                        </table>
                        <table class="field-row">
                            <tr>
                                <td class="field-label">Familiyasi | Surname:</td>
                                <td class="field-value">{{ $surname ?? 'NOMZOD' }}</td>
                            </tr>
                        </table>
                        <table class="field-row">
                            <tr>
                                <td class="field-label">Ismi | First Name:</td>
                                <td class="field-value">{{ $firstName ?? '-' }}</td>
                            </tr>
                        </table>
                        <table class="field-row">
                            <tr>
                                <td class="field-label">Otasining ismi | Patronymic Name:</td>
                                <td class="field-value">{{ $patronymic ?? '-' }}</td>
                            </tr>
                        </table>
                    </td>
                    <td class="details-photo">
                        <div class="photo-box">
                            @if(isset($candidatePhoto) && !empty($candidatePhoto))
                                <img src="{{ $candidatePhoto }}" style="width: 100%; height: 100%; object-fit: cover;" alt="Photo">
                            @else
                                <table style="width: 100%; height: 125px;">
                                    <tr>
                                        <td style="vertical-align: middle; text-align: center; color: #9ca3af; font-size: 7.5pt; font-weight: bold;">
                                            3x4<br>SURAT
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </div>
                    </td>
                </tr>
            </table>

            <div class="divider-line"></div>

            <!-- Language & Level -->
            <table class="results-row1">
                <tr>
                    <td style="width: 58%; vertical-align: middle;">
                        <span class="field-label" style="font-size: 8.5pt;">Chet tili | Foreign Language</span>
                        <span class="bordered-box" style="margin-left: 8px; padding: 4px 18px;">{{ $languageName ?? 'INGLIZ TILI' }}</span>
                    </td>
                    <td style="width: 42%; text-align: right; vertical-align: middle;">
                        <span class="field-label" style="font-size: 8.5pt;">Daraja | Level</span>
                        <span class="bordered-box" style="margin-left: 8px; padding: 4px 24px; font-size: 10pt;">{{ $cefrLevel ?? ($attempt->cefr_level ?? 'B2') }}</span>
                    </td>
                </tr>
            </table>

            <!-- Test Results Breakdown -->
            <div class="section-title" style="margin-bottom: 4px;">Test sinovi natijalari | Test Results</div>
            <table class="skills-table">
                <tr>
                    <td class="skill-td-left">
                        <table style="border-collapse: collapse;">
                            <tr>
                                <td><span class="skill-label-text">Tinglab tushunish |<br>Listening</span></td>
                                <td><span class="score-box">{{ $scores['listening'] ?? '-' }}</span></td>
                            </tr>
                        </table>
                    </td>
                    <td class="skill-td-mid">
                        <table style="border-collapse: collapse;">
                            <tr>
                                <td><span class="skill-label-text">O'qish |<br>Reading</span></td>
                                <td><span class="score-box">{{ $scores['reading'] ?? '-' }}</span></td>
                            </tr>
                        </table>
                    </td>
                    <td class="skill-td-right">
                        <table style="border-collapse: collapse; margin-left: auto;">
                            <tr>
                                <td><span class="skill-label-text">Umumiy ball |<br>Overall Score:</span></td>
                                <td><span class="score-box">{{ $overallScore ?? ($attempt->final_score !== null ? round($attempt->final_score) : '-') }}</span></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="skill-td-left" style="padding-top: 8px;">
                        <table style="border-collapse: collapse;">
                            <tr>
                                <td><span class="skill-label-text" style="width: 105px;">Yozish |<br>Writing</span></td>
                                <td><span class="score-box">{{ $scores['writing'] ?? '-' }}</span></td>
                            </tr>
                        </table>
                    </td>
                    <td class="skill-td-mid" style="padding-top: 8px;">
                        <table style="border-collapse: collapse;">
                            <tr>
                                <td><span class="skill-label-text">Gapirish |<br>Speaking</span></td>
                                <td><span class="score-box">{{ $scores['speaking'] ?? ($attempt->final_score !== null ? round($attempt->final_score) : '-') }}</span></td>
                            </tr>
                        </table>
                    </td>
                    <td class="skill-td-right" style="padding-top: 8px;">
                        <!-- intentionally empty to balance -->
                    </td>
                </tr>
            </table>

            <div class="divider-line" style="margin-top: 14px;"></div>

            <!-- Dates -->
            <table class="dates-table">
                <tr>
                    <td style="width: 50%;">
                        <span class="field-label" style="font-size: 8.5pt;">Berilgan sanasi | Date of issue:</span>
                        <strong style="font-size: 9pt; margin-left: 8px;">{{ $issueDate ?? now()->format('d.m.Y') }}</strong>
                    </td>
                    <td style="width: 50%; text-align: right;">
                        <span class="field-label" style="font-size: 8.5pt;">Amal qilish muddati | Valid until:</span>
                        <strong style="font-size: 9pt; margin-left: 8px;">{{ $validUntil ?? now()->addYears(2)->subDay()->format('d.m.Y') }}</strong>
                    </td>
                </tr>
            </table>

            <!-- Signatures & QR -->
            <table class="bottom-table">
                <tr>
                    <td style="width: 30%; vertical-align: middle;">
                        <div class="director-label">
                            MultiTest Baholash |<br>Official Assessment
                        </div>
                    </td>
                    <td style="width: 40%;" class="qr-center">
                        @if(isset($qrCodeUrl) && !empty($qrCodeUrl))
                            <img src="{{ $qrCodeUrl }}" class="qr-img" alt="QR Code">
                        @elseif(isset($verifyUrl) && !empty($verifyUrl))
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($verifyUrl) }}" class="qr-img" alt="QR Code">
                        @endif
                    </td>
                    <td style="width: 30%; vertical-align: middle;" class="director-name">
                        MULTITEST.UZ
                    </td>
                </tr>
            </table>

            <div class="footer-note">
                Sertifikatning haqiqiyligini multitest.uz sayti orqali tekshirish mumkin.
            </div>
        </div>
    </div>
</div>
</body>
</html>
