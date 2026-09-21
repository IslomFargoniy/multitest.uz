# 📱 MultiTest Android — Versiyalash Qo'llanmasi (Versioning Guide)

Ushbu hujjat MultiTest Android ilovasining versiyalarini boshqarish qoidalarini belgilaydi.

---

## 📌 Qoida (Auto-increment Protocol)
Har safar yangi build (`Release` yoki `Debug` APK) yig'ilganda:
1. `android/version.properties` faylidagi qiymatlar oshiriladi:
   - `VERSION_CODE` += 1
   - `VERSION_NAME` patch versiyasi += 1 (masalan: `1.0.0` -> `1.0.1` -> `1.0.2` ...)

2. Gradle avtomatik ravishda `version.properties` faylidan ushbu qiymatlarni o'qiydi va APK nomini shunga mos ravishda shakllantiradi:
   - `MultiTest_v1.0.1_release.apk`
   - `MultiTest_v1.0.1_debug.apk`

---

## 🛠 `android/version.properties` Tuzilishi:
```properties
VERSION_CODE=2
VERSION_NAME=1.0.1
```

---

## 📜 Tarix (Changelog):
- **v1.0.1 (code 2)**: Telegram OTP login oqimi `panel.prava24.uz` bilan to'liq tenglashtirildi, `FlexibleBooleanSerializer` bilan boolean formatlash xatosi bartaraf etildi, `singleTask` & deep link qo'llab-quvvatlandi.
- **v1.0.0 (code 1)**: Dastlabki versiya (Jetpack Compose, Clean Architecture, ExoPlayer, Hilt).
