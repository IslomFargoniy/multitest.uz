# Multitest.uz — Supervisor Sozlamalari

Ushbu konfiguratsiyalar Laravel Scheduler va Redis Queue Workerlarni fonda to'xtovsiz ishlashini ta'minlaydi.

## 1. Konfiguratsiya fayllarini nusxalash:
```bash
sudo cp supervisor/multitest-scheduler.conf /etc/supervisor/conf.d/
sudo cp supervisor/multitest-worker.conf /etc/supervisor/conf.d/
```

> **Eslatma**: `/var/www/multitest.uz` yo'lini serveringizdagi loyihaning haqiqiy papkasi (masalan `/home/deploy/multitest.uz`) ga moslab o'zgartiring.

## 2. Supervisor'ni yangilash va ishga tushirish:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start multitest-scheduler:*
sudo supervisorctl start multitest-worker:*
```

## 3. Holatni tekshirish:
```bash
sudo supervisorctl status
```
