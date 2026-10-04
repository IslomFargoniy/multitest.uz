# MultiTest.uz — Deploy qo'llanmasi

Ishlab chiqarish (production) serveriga yuklash, yangilash va fon xizmatlarini boshqarish.

> Server manzili, foydalanuvchi nomi va papka yo'llari bu hujjatda ataylab yozilmagan. Quyida
> `<server>`, `<ilova_foydalanuvchisi>` va `<loyiha_papkasi>` o'rnini o'zingizning qiymatlaringiz bilan to'ldiring
> (ularni repoga yozmang).

## Talablar (serverda)
- PHP 8.3 (`mbstring` **mbregex bilan**, `pdo_mysql`, `fileinfo`, `gd`), Composer
- Node 22+ va npm
- MySQL 8
- **FFmpeg** (`ffmpeg -version` ishlashi kerak) — audio MP3 ga siqiladi
- Supervisor (`queue:work` va `schedule:work` uchun)
- Veb-server `public/storage` ichida PHP ni **bajarmasligi** kerak

## Birinchi marta sozlash
```bash
cd <loyiha_papkasi>
cp .env.example .env            # va ichini to'ldiring: APP_ENV=production, APP_DEBUG=false, DB_*, ADMIN_*, GEMINI_*, Telegram, Google
php artisan key:generate
php artisan storage:link
```
Muhim `.env` qiymatlari: `ADMIN_PASSWORD` (kamida 12 belgi), `TELEGRAM_WEBHOOK_SECRET`, `GOOGLE_ALLOWED_CLIENT_IDS`,
`TELESCOPE_ENABLED=false`, `L5_SWAGGER_ENABLED=false`. To'liq ro'yxat: [`README.md`](README.md).

## Yangilash (har deploy)
Barcha buyruqlar **ilova foydalanuvchisi** nomidan bajariladi (`sudo` kerak emas; faqat `supervisorctl` uchun kerak).

```bash
ssh <ilova_foydalanuvchisi>@<server>
cd <loyiha_papkasi>

php artisan down
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize           # config, route, view keshlari
php artisan queue:restart      # worker yangi kod bilan qayta ishga tushadi
php artisan up
```

> Migratsiyadan oldin **ma'lumotlar bazasidan zaxira nusxa** oling (ayniqsa strict rejimga o'tishda: `attempt_parts` dagi
> noto'g'ri sanalar tuzatiladi).

Telegram webhook va bot buyruqlarini (birinchi marta yoki token/secret o'zgarganda) ro'yxatdan o'tkazing:
```bash
php artisan telegram:setup
```

TinyMCE versiyasi yangilansa (`npm update tinymce`), `npm run sync:tinymce` bilan `public/vendor/tinymce` ni yangilang.

## Supervisor
Konfiguratsiyalar va o'rnatish: [`supervisor/README.md`](supervisor/README.md).
1. **`multitest-worker`** — navbat: AI baholash, audio siqish, Telegram/email xabarlari.
2. **`multitest-schedule`** — har kuni 03:00 da 30 kundan eski **audio fayllarni** o'chiradi (urinishlar va ballar saqlanadi).

```bash
sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl restart multitest-worker:* multitest-schedule:*
sudo supervisorctl status multitest-worker:* multitest-schedule:*
```

## Foydali buyruqlar
```bash
php artisan attempts:clean-old 30          # 30 kundan eski audio fayllarni qo'lda tozalash
php artisan attempts:evaluate-recent 10    # oxirgi 10 kundagi baholanmagan javoblarni qayta navbatga qo'yish
php artisan content:sanitize --dry-run     # saqlangan HTML matnlarni tekshirish (o'zgartirmaydi)
```

## Loglar
```bash
tail -f <loyiha_papkasi>/storage/logs/laravel.log
tail -f <loyiha_papkasi>/storage/logs/worker.log
tail -f <loyiha_papkasi>/storage/logs/schedule.log
tail -f <loyiha_papkasi>/storage/logs/audio_cleanup.log
```
