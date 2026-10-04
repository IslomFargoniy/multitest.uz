# MultiTest.uz

AI-assisted **CEFR / IELTS Speaking exam simulator** for Uzbekistan (UzBMB multilevel format, score 0–75).
Teachers build tests and run proctored mock exams; students and mock candidates record spoken answers that are
transcribed and graded by Gemini, then reviewed and scored by a teacher. Results come with a verifiable certificate.

| Part | Stack |
|------|-------|
| Backend | Laravel 12, PHP 8.2+, MySQL, Sanctum (API tokens), Spatie Permission (`Admin`, `Teacher`, `Student`) |
| Web | React 19, Inertia 2, TypeScript, Tailwind 4, Vite 6, i18next (uz / en / ru) |
| Mobile | Kotlin, Jetpack Compose, Hilt, Retrofit — see [`android/`](android/) |
| Integrations | Google Gemini (grading), Telegram bot + Mini App + OTP login, Google sign-in, FFmpeg (audio compression) |

## Requirements

- PHP 8.2+ with `mbstring` (including `mbregex`), `pdo_mysql`, `fileinfo`, `gd`
- MySQL 8 (SQLite is used for tests only)
- Node 22+ and npm
- **FFmpeg** on the server `PATH` (answers are compressed to 32 kbps MP3 before grading)
- A queue worker and the scheduler (see [`deploy.md`](deploy.md))

## Setup

```bash
composer install
npm ci
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

Fill in `.env` (database, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — at least 12 characters, `GEMINI_API_KEY`, Telegram and Google
settings, see below), then:

```bash
php artisan migrate --seed   # creates roles, languages and the initial admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                  # or `npm run build` for production assets
php artisan queue:work       # grading and audio compression run on the queue
```

There are no default credentials. The seeder refuses to create an admin in non-local environments without a strong `ADMIN_PASSWORD`.

## Configuration

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE` | Initial admin created by `UserSeeder` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Speech grading |
| `MultitestUzBot_TOKEN` | Telegram bot token (never commit it) |
| `TELEGRAM_WEBHOOK_SECRET` | Required header secret for `/bot/MultitestUzBot/webhook` (the webhook rejects everything without it) |
| `TELEGRAM_AUTH_MAX_AGE` | Max age (seconds) of Telegram login data, default 86400 |
| `TELEGRAM_DONATION_CARD`, `TELEGRAM_PER_QUESTION_NOTIFY` | Optional bot behaviour |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Web Google sign-in |
| `GOOGLE_ALLOWED_CLIENT_IDS` | Comma-separated OAuth client IDs (web + Android) accepted by the mobile API; empty disables Google login there |
| `DB_STRICT` | MySQL strict mode, `true` by default |
| `TELESCOPE_ENABLED` | Keep `false` in production unless the gate in `TelescopeServiceProvider` is configured |

After deploying, register the Telegram webhook and bot commands:

```bash
php artisan telegram:setup
```

## Roles

- **Admin** — everything, including user management.
- **Teacher** — creates tests (limited by `users.create_test_limit`), runs mocks, sees and grades attempts of their own tests and mocks.
- **Student** — takes public tests, sees only their own attempts.
- **Mock candidates** enter an exam with a code (`MSXXXXXXXX`) given by the teacher and need no account.

## Useful commands

```bash
php artisan test                    # PHPUnit/Pest (SQLite in memory; FFmpeg tests are skipped without ffmpeg)
npx tsc --noEmit                    # type check
npm run build                       # production assets
npm run sync:tinymce                # refresh public/vendor/tinymce after upgrading the tinymce package
php artisan attempts:clean-old 30   # delete recorded audio older than 30 days (attempts and scores are kept)
php artisan attempts:evaluate-recent 10
php artisan content:sanitize --dry-run   # report stored rich text that the HTML sanitizer would change
```

## Android app

See [`android/README.md`](android/README.md) and [`android/VERSIONING.md`](android/VERSIONING.md). Release builds need
`android/keystore.properties`; Google sign-in needs `GOOGLE_WEB_CLIENT_ID`.

## Security

Report vulnerabilities privately to **abdurahmanislam304@gmail.com** instead of opening a public issue.

## License

MIT.
