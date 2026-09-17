# MultiTest.uz - Serverga Deploy Qo'llanmasi

Ushbu hujjat **MultiTest.uz** loyihasini ishlab chiqarish (production) serveriga yuklash, yangilash va xizmatlarni boshqarish bo'yicha to'liq qo'llanmadir.

---

## 🖥️ Server Ma'lumotlari

- **Host (IP):** `193.180.213.188`
- **SSH Foydalanuvchi:** `younine`
- **Loyiha katalogi:** `/var/www/multitest_uz_usr69/data/www/multitest.uz`
- **Tizim foydalanuvchisi / guruhi:** `multitest_uz_usr69:multitest_uz_usr69`
- **PHP versiyasi:** `8.3`
- **Node versiyasi:** `v22.19.0` (npm `10.9.3`+)

---

## ⚡ 1-Qatorda Tezkor Deploy (Lokal kompyuterdan)

Lokal terminalingizdan quyidagi buyruqni bering:

```bash
ssh younine@193.180.213.188 "cd /var/www/multitest_uz_usr69/data/www/multitest.uz && \
sudo git pull origin main && \
sudo composer install --no-dev --optimize-autoloader && \
sudo npm install && \
sudo npm run build && \
sudo php artisan migrate --force && \
sudo php artisan optimize:clear && \
sudo chown -R multitest_uz_usr69:multitest_uz_usr69 storage bootstrap/cache && \
sudo chmod -R 775 storage bootstrap/cache && \
sudo supervisorctl restart multitest-worker:* multitest-schedule:*"
```

---

## 📋 Qadamma-qadam Deploy Jarayoni

### 1. Serverga SSH orqali ulanish
```bash
ssh younine@193.180.213.188
```

### 2. Loyiha katalogiga o'tish
```bash
cd /var/www/multitest_uz_usr69/data/www/multitest.uz
```

### 3. Git orqali eng so'nggi kodni tortib olish
```bash
sudo git pull origin main
```

### 4. Backend (PHP Composer) bog'liqliklarini yangilash
```bash
sudo composer install --no-dev --optimize-autoloader
```

### 5. Frontend (NPM & Vite) assetlarini yig'ish
```bash
sudo npm install
sudo npm run build
```

### 6. Ma'lumotlar bazasi migratsiyalari va keshni tozalash
```bash
sudo php artisan migrate --force
sudo php artisan optimize:clear
```

### 7. Fayl ruxsatlarini (Permissions) to'g'rilash
```bash
sudo chown -R multitest_uz_usr69:multitest_uz_usr69 /var/www/multitest_uz_usr69/data/www/multitest.uz/storage /var/www/multitest_uz_usr69/data/www/multitest.uz/bootstrap/cache
sudo chmod -R 775 /var/www/multitest_uz_usr69/data/www/multitest.uz/storage /var/www/multitest_uz_usr69/data/www/multitest.uz/bootstrap/cache
```

---

## ⚙️ Supervisor Xizmatlari (Background Workers)

Loyihada **2 ta asosiy fon xizmati** mavjud:
1. **`multitest-worker`** — Navbatdagi ishlarni (AI tahlili, Telegram bildirishnomalar, audio qayta ishlash) bajaradi.
2. **`multitest-schedule`** — Har kuni kechasi 03:00 da 30 kundan eski audio fayllarni diskdan avtomatik tozalovchi vazifani bajaradi.

### Supervisor konfiguratsiya fayllari joylashuvi:
- `/etc/supervisor/conf.d/multitest-worker.conf`
- `/etc/supervisor/conf.d/multitest-scheduler.conf`

#### `multitest-worker.conf`:
```ini
[program:multitest-worker]
process_name=%(program_name)s_%(process_num)02d
directory=/var/www/multitest_uz_usr69/data/www/multitest.uz
command=/usr/bin/php /var/www/multitest_uz_usr69/data/www/multitest.uz/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=root
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/worker.log
stopwaitsecs=3600
```

#### `multitest-scheduler.conf`:
```ini
[program:multitest-schedule]
process_name=%(program_name)s_%(process_num)02d
directory=/var/www/multitest_uz_usr69/data/www/multitest.uz
command=/usr/bin/php /var/www/multitest_uz_usr69/data/www/multitest.uz/artisan schedule:work
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=root
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/schedule.log
stopwaitsecs=3600
```

### Supervisorni yangilash va qayta ishga tushirish:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart multitest-worker:* multitest-schedule:*
```

### Supervisor holatini tekshirish:
```bash
sudo supervisorctl status multitest-worker:* multitest-schedule:*
```

---

## 🧹 Qo'shimcha Foydali Buyruqlar

### 30 kundan eski audio fayllarni qo'lda tozalash:
```bash
sudo php artisan attempts:clean-old 30
```

### Loglarni kuzatish:
```bash
# Laravel umumiy xatoliklar logi:
tail -f /var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/laravel.log

# Supervisor Queue Worker logi:
tail -f /var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/worker.log

# Supervisor Scheduler logi:
tail -f /var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/schedule.log

# 30 kunlik audio tozalash logi:
tail -f /var/www/multitest_uz_usr69/data/www/multitest.uz/storage/logs/audio_cleanup.log
```
