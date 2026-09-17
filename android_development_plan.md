# 📱 MultiTest Android (Kotlin) — Ishlab Chiqish Rejasi (panel.prava24.uz asosida)

Ushbu reja **panel.prava24.uz** loyihasida sinovdan o'tgan va muvaffaqiyatli ishlayotgan **Telegram Bot OTP** va **Google OAuth (id_token)** autentifikatsiya arxitekturasi asosida tuzilgan.

---

## 🏗 1. Autentifikatsiya Arxitekturasi (panel.prava24.uz uslubida)

```
                            ┌────────────────────────────────────────┐
                            │        Android Auth Ekran             │
                            └───────────────────┬────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
      ┌──────────▼───────────┐                                      ┌──────────▼───────────┐
      │  Google Sign-In      │                                      │  Telegram OTP        │
      │  (Credential Manager)│                                      │  (Bot orqali kod)    │
      └──────────┬───────────┘                                      └──────────┬───────────┘
                 │ (Google id_token)                                           │ (6 xonali OTP kod)
                 ▼                                                             ▼
      ┌──────────────────────┐                                      ┌──────────────────────┐
      │ POST /api/auth/google│                                      │POST /api/auth/login-otp│
      └──────────┬───────────┘                                      └──────────┬───────────┘
                 │                                                             │
                 │   https://oauth2.googleapis.com/tokeninfo                   │  Otp::where('code', $otp)
                 │   Google id_token tekshiriladi                              │  Muddati: 2 daqiqa
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │  Laravel Sanctum Token │
                                    │  { success: true,      │
                                    │    data: { user, token}│
                                    └────────────────────────┘
```

---

## 🔑 2. Autentifikatsiya Oqimlari (Flows)

### A. Telegram OTP orqali kirish (Faqat 6 xonali kod bilan)
1. **Kod olish**: Foydalanuvchi ilovadagi **"Telegram orqali kod olish"** tugmasini bosadi $\rightarrow$ Telegram botimiz (`@MultiTestBot`) ochiladi.
2. **Bot xabari**: Bot foydalanuvchining `telegram_id` siga bog'langan holda 6 xonali OTP generatsiya qiladi:
   ```text
   🔐 *Android Tasdiqlash kodi*

   👉 `571482`

   ⏳ Kod 2 daqiqa davomida amal qiladi.
   ```
3. **Ilovaga kiritish**: Foydalanuvchi ilovaga qaytib, 6 xonali kodni kiritadi.
4. **Backend tekshiruvi (`POST /api/auth/login-otp`)**:
   ```json
   {
       "otp": "571482"
   }
   ```
   - Backend `Otp` jadvalidan kodni qidiradi (`where('code', $otp)->where('expired', false)->where('expired_at', '>', now())`).
   - Kod to'g'ri bo'lsa: `expired = true` qilinadi va Sanctum Bearer token beriladi.
   - *Test/Developer bypass master kod*: `159123` (Apple/Google reviewerlar va lokal test uchun).

---

### B. Google OAuth orqali kirish (Google id_token)
1. **Google tugmasi**: Foydalanuvchi "Google bilan kirish" tugmasini bosadi.
2. **Google Credential Manager**: Android tizimi Google akkaunt tanlash oynasini ochadi va `id_token` qaytaradi.
3. **Backend tekshiruvi (`POST /api/auth/google`)**:
   ```json
   {
       "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
   }
   ```
   - Laravel `https://oauth2.googleapis.com/tokeninfo?id_token={id_token}` orqali Google serveridan tekshiradi.
   - Google `sub` (Google ID), `email`, `name`, `picture` ma'lumotlari olinadi.
   - Foydalanuvchi topiladi yoki yangi yaratilib, `Student` roli va Sanctum token taqdim etiladi.

---

## 📡 3. Backend (Laravel) uchun zarur modullar

### 1. `otps` Jadvali Migratsiyasi (`create_otps_table.php`):
```php
Schema::create('otps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('code', 10)->index();
    $table->timestamp('expired_at');
    $table->boolean('expired')->default(false);
    $table->boolean('is_android')->default(false);
    $table->boolean('is_ios')->default(false);
    $table->boolean('is_mobile')->default(true);
    $table->timestamps();
});
```

### 2. `Api\LoginController.php`:
* `loginWithOtp(Request $request)` — 6 xonali OTP bilan login qilish.
* `loginWithGoogle(Request $request)` — Google `id_token` bilan kirish.
* `login(Request $request)` — Email va parol bilan kirish (zaxira).

### 3. `TelegramBotService.php`:
* Botga `/start` bosilganda yoki "🔑 Kirish kodi" tugmasi bosilganda 6 xonali OTP yaratib, Markdown formatida chiroyli qilib yuborish.

---

## 📱 4. Android (Kotlin + Jetpack Compose) Arxitekturasi

### 🛠 Texnologik to'plam:
* **UI**: Jetpack Compose + Material 3 Design
* **Arxitektura**: Clean Architecture + MVI/MVVM (ViewModel + StateFlow)
* **Dependency Injection**: Dagger Hilt
* **Tarmoq**: Retrofit2 + OkHttp3 (AuthInterceptor bilan)
* **Xavfsiz Saqlash**: Preferences DataStore / EncryptedSharedPreferences (`auth_token`, `user`)
* **Audio Player**: Media3 (ExoPlayer) — Savol va instruksiya audiolari
* **Ovoz Yozish (Microphone)**: `AudioRecord` / `MediaRecorder` (AAC/M4A format)
* **Fon Vazifalari**: `WorkManager` — Yozilgan audio javoblarni kafolatlangan holda serverga yuklash

---

## 📅 5. Bosqichma-bosqich Reja (Sprints)

### 📍 1-BOSQICH: Backend API & Telegram OTP (prava24 nusxasi) [2 kun]
* [ ] `otps` migratsiyasi va `Otp` modelini yaratish.
* [ ] `TelegramBotService` ga `createAndSendOtp` logikasini qo'shish.
* [ ] `POST /api/auth/login-otp` va `POST /api/auth/google` kontrollerlarini joriy qilish.
* [ ] Speaking imtihonlari va testlar uchun REST API larni tayyorlash (`/api/v1/tests`, `/api/v1/attempts`).

### 📍 2-BOSQICH: Android Loyiha Asosi & Auth Ekrani [3 kun]
* [ ] Android Studio (Kotlin + Jetpack Compose) loyihasini ochish.
* [ ] Hilt, Retrofit, DataStore va Navigation Compose ni sozlash.
* [ ] **AuthScreen**:
  * 6 xonali PinView (OTP kiritish maydoni).
  * "Telegram botdan kod olish" tugmasi (DeepLink: `tg://resolve?domain=MultiTestBot`).
  * "Google bilan kirish" (Google Credential Manager).
* [ ] Avtomatik Splash Login tekshiruvi (token mavjud bo'lsa to'g'ridan-to'g'ri Dashboardga o'tish).

### 📍 3-BOSQICH: Dashboard, Testlar va Mock Tizimi [3 kun]
* [ ] Dashboard ekrani (Oxirgi urinishlar, statistika).
* [ ] Testlar kutubxonasi (CEFR darajalari, filtrlar, qidiruv).
* [ ] Mock imtihonga maxfiy kod bilan ulanish dialogi.
* [ ] Natijalar tarixi (Baho va tahlillar).

### 📍 4-BOSQICH: Native Speaking Imtihon Dvigateli (Core) [5 kun]
* [ ] `ExoPlayer` orqali savol audiosini o'ynatish.
* [ ] Tayyorgarlik (15-30s) va Javob berish (30-60s) taymerlari + Ovozli Beep.
* [ ] Real-vaqt mikrofon ovoz to'lqini (Visualizer).
* [ ] `AudioRecord` orqali yuqori sifatli siqilgan audio yozish.
* [ ] `WorkManager` bilan serverga multipart audio yuklash.
* [ ] Anti-Cheat (`FLAG_KEEP_SCREEN_ON`, fon rejimiga o'tishni cheklash).

### 📍 5-BOSQICH: Google Play Marketga Chiqarish [2 kun]
* [ ] Keystore yaratish va Release `.aab` yig'ish.
* [ ] Data Safety (Audio recording ruxsatnomasi tushuntirishi).
* [ ] Privacy Policy va Play Store grafiklari (Icon 512x512, Feature Graphic 1024x500).
* [ ] Play Console ga yuklash va tekshiruvga yuborish.

---

## 🎯 Xulosa
Ushbu arxitektura foydalanuvchiga SMS kutish yoki parollarni eslab qolish majburiyatini yuklamaydi. **Telegram OTP** orqali 2 soniyada kiradi yoki **Google** hisobi bilan bitta bosishda tizimga ulanadi.
