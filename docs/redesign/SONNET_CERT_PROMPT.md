# MultiTest.uz — Certificate cleanup (brief for the coding agent)

The PDF certificate and its verify page (Antigravity commits `872cc25..86aa604`) are deployed and work.
A review found legal-risk wording, one state-symbol file and a few small correctness gaps.
This brief fixes them. Read this file and `AGENTS.md` first. Work phase by phase (§5), tick `[x]` when done,
and report to the owner in **Uzbek (Latin)** (§7).

## 1. Rules

1. Touch only the files named in §3. No changes to routes, policies, migrations or other features.
2. Branch per phase from `main`: `fix/cert-<n>-<slug>`; small commits (`fix(cert): …`).
   **Do not push and do not deploy** unless the owner explicitly says so in this session (procedure in §6).
3. After every phase run and paste the tail of: `npx tsc --noEmit`, `npm run build`, `php artisan test`.
   (Android is not touched; no APK build, no version bump.)
4. Never print `.env` values. Do not work around a denied permission; stop and report.
5. Every user-visible text change below is given **exactly**. Do not invent other wording.
   If a text does not fit the layout, shorten the font size, not the text, and say so in the report.

## 2. Background (why)

MultiTest is a private **mock / practice** platform. Its PDF must not look like a state document:
- Using the State Emblem of Uzbekistan without permission is prohibited by law. The file
  `public/images/cert/uzb_emblem.svg` is no longer referenced by any template, but it is still publicly served.
- "Official Assessment", "Rasmiy Tasdiqlangan", "SERTIFIKAT / CERTIFICATE OF LANGUAGE PROFICIENCY" and a
  2-year "Valid until" date make a mock result look like a national certificate (UzBMB / Multilevel).
- The SEO text in `app.blade.php` claims "Rasmiy UzBMB mezonlari" and "95%+ aniqlik" — the accuracy claim is not
  backed by any measurement.

## 3. Tasks

### 3.1 Remove state-symbol and unused assets (P0)
- `git rm public/images/cert/uzb_emblem.svg public/images/cert/cert_border.svg` — first prove both are unused:
  `grep -rn "uzb_emblem\|cert_border" app resources routes config public --exclude-dir=build` → must be 0 results
  (excluding the files themselves). If `cert_border.svg` is referenced, keep it and say so.
- Check the PDF and verify templates contain no other state symbols, flags or ministry names:
  `grep -niE "gerb|emblem|davlat|vazirlik|ministry|agentlig|uzbmb|dtm|karimov" resources/views/pdf resources/views/certificate`
  → must be 0 results after this phase.

### 3.2 PDF wording — `resources/views/pdf/certificate.blade.php` (P0)
| Where (current) | Replace with |
|---|---|
| L23 CSS comment `MultiTest Official Frame` | `MultiTest result frame` |
| L314 `TIL BILISH DARAJASI BO'YICHA` | `MOCK TEST NATIJASI` |
| L315 `SERTIFIKAT` | `NATIJA HISOBOTI` |
| L316 `CERTIFICATE` | `RESULT REPORT` |
| L317 `OF LANGUAGE PROFICIENCY` | `MOCK TEST RESULT` |
| L458–459 the whole "Amal qilish muddati / Valid until" label + value | **delete** the row (keep table layout intact) |
| L469 `MultiTest Baholash \|<br>Official Assessment` | `MultiTest Baholash \|<br>MultiTest Assessment` |

Add one disclaimer line at the bottom of the page (inside the frame, below the signature/QR table),
font 7pt, colour `#555555`, centred:
```
Ushbu hujjat MultiTest platformasidagi mock test natijasi bo'lib, davlat sertifikati emas va rasmiy hujjat sifatida qabul qilinmaydi. / This document is a MultiTest mock test result. It is not a state certificate and is not an official document.
```
The PDF must still fit on **one A4 page** (check §4).

### 3.3 Verify page — `resources/views/certificate/verify.blade.php` (P0)
- L127 `Haqiqiy Sertifikat` → `Natija tasdiqlandi`
- L128 `Rasmiy Tasdiqlangan` → `MultiTest tizimida mavjud`
- L133 `Sertifikat Raqami` → `Hisobot raqami`
- L161 `📥 PDF Sertifikatni Yuklab Olish` → `PDF hisobotni yuklab olish` (remove the emoji)
- L6 `<title>` → `Natijani tekshirish - MultiTest`
- Add the same disclaimer text from §3.2 (Uzbek sentence only) as a small muted paragraph at the bottom of the card.

### 3.4 Controller — `app/Http/Controllers/CertificateController.php` (P1)
- Delete the `$validUntil` computation and the `'validUntil'` key from the view data.
- QR fallback: in the `catch`, do **not** call `api.qrserver.com` (it leaks the verify code to a third party and
  dompdf may not load it). Set `$qrCodeDataUri = null;` and log the warning. In the template the existing
  `@elseif(isset($verifyUrl) …)` branch then prints the URL as text — check that branch renders the full URL in
  a readable 7pt font; fix only that branch if it does not.
- Avatar: keep the current local-file logic, but harden the path: resolve it with `realpath()` and use it only
  if the real path starts with `realpath(public_path('storage'))` **or** `realpath(storage_path('app/public'))`.
  Anything else (remote URLs, `..`) → `$avatarBase64 = null`. No HTTP fetching.

### 3.5 Remote loading off — `config/laravel-pdf.php` (P1)
All images are now data URIs or local paths, so remote loading is not needed:
`'is_remote_enabled' => env('LARAVEL_PDF_DOMPDF_REMOTE_ENABLED', false),`
Confirm the logo fallback (`public_path(...)` at L298) still renders; if dompdf blocks it because of `chroot`,
set the dompdf `chroot` option to `public_path()` in this config and say so.

### 3.6 Score rows — `resources/views/pdf/certificate.blade.php` (P2)
The platform grades **Speaking only**, so Listening/Reading/Writing rows always print `-`.
Render each of the four rows only when its value is not `null`, except Speaking which is always shown.
(Use `@if(!is_null($scores['listening'] ?? null))` … for L404/L412/L430 blocks; keep L438 as is.)
If hiding rows breaks the table borders, keep the rows and instead print `—` in muted grey; say which you chose.

### 3.7 SEO text — `resources/views/app.blade.php` (P1)
| Line | Replace with |
|---|---|
| L66 description | `MultiTest — CEFR (Multilevel) va IELTS Speaking uchun AI mock test simulyatori. Imtihonga yaqin muhit, tezkor B1, B2, C1 baholash va batafsil tahlil.` |
| L67 keywords | remove `uzbmb milliy sertifikat` and `dtm cefr test`; keep the rest |
| L81 og:description | `CEFR va IELTS Speaking uchun sun'iy intellektli mock test simulyatori. B1, B2, C1 darajangizni mashq qilib aniqlang.` |
| L158 FAQ answer | `AI baholash CEFR mezonlari (Fluency, Lexical Resource, Grammar, Pronunciation) asosida ishlaydi va taxminiy ball beradi. Natija mashq uchun mo'ljallangan, rasmiy imtihon natijasi emas.` |

Keep `UzBMB` in the `<title>` / L65 `meta title` only as `… | Multilevel Mock Test` (replace the words `UzBMB Mock Test`).
Keep the other FAQ entries; in L166 replace `UzBMB Multilevel Speaking` with `Multilevel Speaking`.
Escape rules for the JSON-LD (`@@type`) stay as they are.

### 3.8 Tests — new `tests/Feature/CertificateTest.php` (P1)
Use `Spatie\LaravelPdf\Facades\Pdf::fake()`. Follow the factories/helpers used in `tests/Feature/MockEntryTest.php`.
1. Owner with `final_score` set → `GET route('attempt.certificate', $attempt)` is 200 and
   `Pdf::assertRespondedWithPdf(fn ($pdf) => $pdf->contains('NATIJA HISOBOTI') && ! $pdf->contains('Valid until'))`
   (adapt to the fake's API in the installed version — check `vendor/spatie/laravel-pdf/src`).
2. Another student → 403.
3. Attempt without `final_score` → redirect back with `error`.
4. `GET route('certificate.verify', $code)` → 200, sees `davlat sertifikati emas`, does not see `Rasmiy`.
5. Unknown verify code → 404.

## 4. Acceptance (paste results)
- `grep -rn "uzb_emblem" . --include='*.php' --include='*.blade.php' --exclude-dir=vendor --exclude-dir=node_modules | wc -l` → 0, and `ls public/images/cert` shows no emblem.
- `grep -niE "official|rasmiy|valid until|amal qilish|sertifikat" resources/views/pdf/certificate.blade.php` → only the disclaimer line ("davlat sertifikati emas").
- `grep -n "qrserver" -r app resources` → 0.
- `grep -n "95%" resources/views/app.blade.php` → 0.
- `php artisan test --filter=CertificateTest` passes; full suite passes.
- Render a real PDF locally for any finished attempt (e.g. in `php artisan tinker`, `Pdf::view(...)->save(storage_path('app/cert-check.pdf'))`, or download via the browser) and confirm: 1 page, disclaimer visible, QR visible, no "Valid until". Delete the file afterwards. Attach nothing to git.

## 5. Phases
- [ ] **Phase 1 — P0:** §3.1 + §3.2 + §3.3.
- [ ] **Phase 2 — P1:** §3.4 + §3.5 + §3.7 + §3.8.
- [ ] **Phase 3 — P2:** §3.6, final full check (§4).

## 6. Deploy (ONLY when the owner explicitly asks in this session)
SSH is allowed for `younine@193.180.213.188`; run commands with `sudo -n`. Never print `.env` values.
```bash
cd /var/www/multitest_uz_usr69/data/www/multitest.uz
php artisan down --retry=60
git pull --ff-only origin main   # if not a fast-forward, STOP and report
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev -o --no-interaction
npm ci && npm run build
php artisan migrate --force      # expected: "Nothing to migrate"
php artisan optimize
chown -R multitest_uz_usr69:multitest_uz_usr69 storage bootstrap/cache
php artisan queue:restart
php artisan up
```
Then check `https://multitest.uz/`, `/login`, `/up` return 200, open one `/certificate/verify/{code}` page,
and confirm no new `production.ERROR` lines in `storage/logs/laravel*.log` for 2 minutes. Report the result.

## 7. Report template (Uzbek)
```
## Faza N — <nomi>
Branch: fix/cert-N-...
O'zgargan fayllar: ...
O'chirilgan fayllar: ...
Tekshiruv: tsc ✓/✗ · build ✓/✗ · php artisan test ✓/✗ (N passed)
PDF: 1 sahifa ✓/✗ · disclaimer ✓/✗ · QR ✓/✗
Egasi tekshirishi kerak: PDF yuklab olish, /certificate/verify/{code} sahifasi
Savollar / to'xtagan joylar: ...
```
