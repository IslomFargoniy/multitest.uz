# MultiTest.uz - Agent Instructions & Rules

## 📱 Android Build & Auto-Versioning Rule
Har safar Android ilova build qilinganda (`assembleRelease`, `assembleDebug`):
- `android/version.properties` faylidagi `VERSION_CODE` (butun son) va `VERSION_NAME` (semver) qiymatlarini bittaga oshiring.
- Build natijasida `android/MultiTest_v{versionName}_{buildType}.apk` hosil bo'ladi.
- Foydalanuvchiga versiya raqami va yangi fayl yo'lini taqdim eting.

Batafsil ma'lumot: [`android/VERSIONING.md`](file:///Users/iosdevelopmentcenter/Desktop/AddProjects/multitest.uz/android/VERSIONING.md)
