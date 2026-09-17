# 📱 MultiTest Android Native Application

MultiTest rasmiy Native Android ilovasi. Speaking testlar, mock imtihonlar, real-vaqt ovoz yozib olish va tahlil qilish tizimi.

---

## 🛠 Texnologiyalar Steki
- **Language**: Kotlin 2.1.0
- **UI Framework**: Jetpack Compose + Material Design 3
- **Architecture**: Clean Architecture + MVVM + MVI unidirectional state
- **Dependency Injection**: Dagger Hilt 2.53
- **Network**: Retrofit2 + Kotlinx Serialization + OkHttp3
- **Local Persistence**: Jetpack DataStore Preferences
- **Audio Engine**: AndroidX Media3 ExoPlayer + MediaRecorder (AAC 44.1kHz 128kbps)
- **Authentication**:
  - 🤖 Telegram 6-raqamli OTP (`@multitestuzbot` orqali)
  - 🌐 Google Sign-In (Android Credential Manager)
- **Image Loading**: Coil 2.7.0

---

## 📂 Loyiha Tuzilishi

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/uz/multitest/app/
│   │   │   ├── MultiTestApp.kt                 # Application (@HiltAndroidApp)
│   │   │   ├── MainActivity.kt                 # Single Activity (@AndroidEntryPoint)
│   │   │   ├── core/
│   │   │   │   ├── audio/                      # ExoPlayer & AudioRecorder
│   │   │   │   ├── datastore/                  # SessionManager
│   │   │   │   ├── di/                         # Hilt Module (RepositoryModule)
│   │   │   │   ├── network/                    # Retrofit, ApiService, Interceptor
│   │   │   │   ├── theme/                      # Electric Indigo Palette & Typography
│   │   │   │   └── util/                       # Constants
│   │   │   ├── data/
│   │   │   │   ├── models/                     # Auth, Test, Exam DTOs
│   │   │   │   └── repository/                 # Auth, Test, Exam Repositories
│   │   │   └── presentation/
│   │   │       ├── auth/                       # OTP & Google Login
│   │   │       ├── components/                 # Waveform, Buttons, Inputs
│   │   │       ├── dashboard/                  # Stats, Mocks, Quick tests
│   │   │       ├── exam/                       # Speaking Engine (Timer, Mic, Waveform)
│   │   │       ├── main/                       # BottomNav Scaffold
│   │   │       ├── navigation/                 # NavGraph & Routes
│   │   │       ├── profile/                    # Profile & Attempt History
│   │   │       ├── result/                     # Result & Voice Playback
│   │   │       ├── splash/                     # Animated Splash
│   │   │       └── tests/                      # Tests list & Test Detail
│   │   └── res/
│   │       ├── values/ (colors, strings, themes)
│   │       └── xml/ (network_security, backup)
├── gradle/
│   ├── libs.versions.toml                      # Version catalog
│   └── wrapper/
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

---

## 🚀 Android Studio orqali ishga tushirish

1. **Android Studio** (Ladybug / Koala / Hedgehog) dasturini oching.
2. `Open Project` tugmasini bosib, `multitest.uz/android` papkasini tanlang.
3. Gradle Sync avtomatik yuklanadi.
4. Emulator yoki ulangan Android qurilmani tanlang va `Run 'app'` (Shift + F10) bosing.

---

## 🔑 Sinov ma'lumotlari (Test Credentials)
- **Telegram Bot**: `@multitestuzbot`
- **Test OTP Kodu**: `159123` (Admin / Demo foydalanuvchi sifatida to'g'ridan-to'g'ri tizimga kiradi)
- **Backend API**: `https://multitest.uz/api/`
