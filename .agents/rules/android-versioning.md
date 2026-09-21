# 📱 Android Versioning & Build Rules

## 📌 Qoida (Mandatory Rule)
Har safar Android ilovani build qilish (`./gradlew assembleRelease` yoki `./gradlew assembleDebug`) so'ralganda yoki yangi o'zgarishlar kiritilib yangi build chiqarilganda:
1. `android/version.properties` faylidagi versiyalarni bittaga oshirish shart:
   - `VERSION_CODE` bittaga oshiriladi (masalan: `1` -> `2` -> `3`).
   - `VERSION_NAME` ning patch versiyasi bittaga oshiriladi (masalan: `1.0.0` -> `1.0.1` -> `1.0.2` yoki yangi funksiyalar bo'lsa `1.1.0`).
2. Yig'ilgan APK fayllar `android/MultiTest_v{VERSION_NAME}_{buildType}.apk` formatida saqlanadi.
3. Foydalanuvchiga build natijasi haqida ma'lumot berganda, yangi versiya raqami (`versionName`, `versionCode`) va fayl hajmini aniq ko'rsatish kerak.

---

## 📂 Versiya fayli joylashuvi:
`android/version.properties`:
```properties
VERSION_CODE=2
VERSION_NAME=1.0.1
```
