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

## 🔑 Release imzolash
`android/keystore.properties` (gitignore'da) faylini yarating:
```properties
storeFile=/absolute/path/to/multitest-release.jks
storePassword=...
keyAlias=...
keyPassword=...
```
Faylsiz `assembleRelease` xato beradi. Faqat lokal sinov uchun: `./gradlew assembleRelease -PallowDebugSigning=true` (bunday APK'ni nashr qilmang).

Google login: `local.properties` ichiga `GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com` yozing (bo'sh bo'lsa tugma yashiriladi). Server `GOOGLE_ALLOWED_CLIENT_IDS` ichida shu ID bo'lishi shart.

---

## 🛠 `android/version.properties` Tuzilishi:
```properties
VERSION_CODE=2
VERSION_NAME=1.0.1
```

---

## 📜 Tarix (Changelog):
- **v1.0.12 (code 13)**: Pastki navigatsiyada aktiv bo'lim aniq ko'rinadi (yangi nav-active ranglari), palitra web bilan bir xil Night Focus tokenlariga keltirildi, gradientlar olib tashlandi, `GradientButton` → `PrimaryButton`.
- **v1.0.10 (code 11)**: Javoblarni yuklash qayta urinish (retry) bilan, xatoda "Qayta urinish" ekrani (bo'limlar jimgina o'tkazib yuborilmaydi), audio faqat bir marta yuboriladi, vaqt belgilari UTC (ISO-8601), Mock'ga nomzod kodi (MSXXXXXXXX) bilan ulanish, demo-kod tugmasi olib tashlandi, Google tugmasi faqat `GOOGLE_WEB_CLIENT_ID` sozlanganda ko'rinadi, release imzosi `keystore.properties` orqali, backup o'chirildi.
- **v1.0.9 (code 10)**: AI baholash JSON'ini tahlil qilish va natija kartochkalari.
- **v1.0.8 (code 9)**: OTP/PIN kiritish kataklari tekis va moslashuvchan.
- **v1.0.7 (code 8)**: Test bo'limlari soni, atamalar yagonaligi, vaqt formati va to'liq natijalar.
- **v1.0.6 (code 7)**: Speaking: audio ko'rsatma bosqichi tayyorgarlik taymeridan ajratildi.
- **v1.0.5 (code 6)**: Savol audiosini ijro etish va koordinatsiya tuzatildi.
- **v1.0.2 (code 3)**: Urinish modellari va xatolik xabarlarini ajratib olish yaxshilandi.
- **v1.0.1 (code 2)**: Telegram OTP login oqimi `panel.prava24.uz` bilan to'liq tenglashtirildi, `FlexibleBooleanSerializer` bilan boolean formatlash xatosi bartaraf etildi, `singleTask` & deep link qo'llab-quvvatlandi.
- **v1.0.0 (code 1)**: Dastlabki versiya (Jetpack Compose, Clean Architecture, ExoPlayer, Hilt).
