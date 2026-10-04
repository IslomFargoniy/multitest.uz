# Multitest.uz — Supervisor sozlamalari

Ushbu konfiguratsiyalar Laravel navbat ishchisi (`queue:work`) va rejalashtiruvchisini (`schedule:work`) fonda
to'xtovsiz ishlashini ta'minlaydi. **Dasturlar `root` emas, ilova foydalanuvchisi nomidan ishlaydi.**

## 1. Fayllarni nusxalash va moslash
```bash
sudo cp supervisor/multitest-scheduler.conf /etc/supervisor/conf.d/
sudo cp supervisor/multitest-worker.conf /etc/supervisor/conf.d/
```

Ikkala fayldagi `APP_USER` ni serverdagi ilova foydalanuvchisiga (`user=` va yo'llarda) almashtiring:
```bash
sudo sed -i 's/APP_USER/<ilova_foydalanuvchisi>/g' /etc/supervisor/conf.d/multitest-*.conf
```
Yo'l (`/var/www/<user>/data/www/multitest.uz`) serveringizdagi haqiqiy loyiha papkasiga mos bo'lishi kerak.

Worker `--timeout=180 --tries=3` bilan ishlaydi: Gemini baholash so'rovi uzoq cho'zilishi mumkin, standart 60 soniya yetmaydi.

## 2. Ishga tushirish
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart multitest-worker:* multitest-schedule:*
```

## 3. Holatni tekshirish
```bash
sudo supervisorctl status multitest-worker:* multitest-schedule:*
```
