<div align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" alt="Laravel 12" width="400">
  
  <br />
  <h3>The ultimate high-performance boilerplate to kickstart your next Modern Web App.</h3>

  <p>
    <a href="https://github.com/IslomFargoniy"><img src="https://img.shields.io/badge/Author-Islam_Abdurahman-2ea44f?style=for-the-badge&logo=github" alt="Author"></a>
    <img src="https://img.shields.io/badge/Laravel-v12-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel">
    <img src="https://img.shields.io/badge/React-v19-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React">
    <img src="https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
    <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
  </p>
</div>

<br />

Welcome to **Multitest** – A meticulously crafted, premium starter kit bringing the power of **Laravel 12** and **React 19** via **Inertia.js** together. Designed for scalability, maximum developer productivity, and striking UI out-of-the-box.

---

## ✨ Premium Features

Experience a flawless development environment with our rich, pre-configured tech stack built directly into the repository:

- 🏎️ **Next-Gen Frontend:** React 19 + Inertia.js with ultra-fast **Vite 6** & **Tailwind CSS v4**.
- 🔐 **Advanced Role & Permission Management:** Robust Access Control using `spatie/laravel-permission`.
- 💳 **Global Payments API:** Integrated `PayUz` supporting **Payme, Click, Oson, Uzcard, Paynet**, and **Stripe**.
- 🤖 **Native AI Integrations:** Ready-to-use **ChatGPT** (`openai-php/client`) and **Gemini** (`google-gemini-php/client`).
- 🌍 **Deep Multilingual Support:** Reach your global audience with 7 localizations: *Uzbek, Uzbek Krill, Russian, English, Italian, Spanish, German*.
- 📱 **Progressive Web App (PWA):** Seamless offline support out-of-the-box with `laravelpwa`.
- 🎨 **Beautiful & Interactive UIs:** Flowbite React, Radix UI primitives, **ECharts**, **ApexCharts**, and Framer Motion + Tailwind animate plugins pre-configured.
- ⚙️ **Developer Experience (DX):** Built-in **Swagger API Docs** (`l5-swagger`), **Laravel Telescope** for debugging, comprehensive Prettier/ESLint flows.
- 💬 **Telegram Support:** Manage chat operations effortlessly via `telegram-bot-sdk`.

---

## 🚀 Getting Started

Launch your fully-featured application in seconds. 

### 1. Prerequisites
- **PHP** >= 8.2
- **Node.js** >= 22.x
- **Composer** & **NPM**

### 2. Installation

Clone this repository and install its dependencies.

```bash
composer install
npm install
```

### 3. Setup Environment

Create your local `.env` file and generate essential keys.

```bash
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

Set your database credentials in `.env`, then run migrations alongside initial payment setup:

```bash
php artisan migrate --seed
php artisan db:seed --class="Goodoneuz\PayUz\database\seeds\PayUzSeeder"
```

### 4. Serve & Develop

Boot up the Laravel development environment and concurrently run your frontend hot-reloading:

```bash
# Serves Vite, Laravel, and Queues concurrently based on configuration
npm run dev
```
*(Optionally you can run `php artisan serve` and `npm run dev` in separate terminals).*

> 🔑 **Admin:** set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (min 12 characters) in `.env` before running `php artisan db:seed`.

---

## 📖 Deep-Dive Setup

### Swagger API Endpoints
To dynamically render your interactive visual documentation powered by Swagger via `darkaonline/l5-swagger`:
```bash
php artisan l5-swagger:generate
```
Access the UI via: `https://your-domain.local/api/documentation`

### Payment Gateway Configuration
Process payments gracefully! Add your endpoints logic into `web.php` or a dedicated route file:

```php
// Handle inbound responses from payment systems
Route::any('/handle/{paysys}', function($paysys) {
    (new Goodoneuz\PayUz\PayUz)->driver($paysys)->handle();
});

// Trigger an outbound payment redirect
Route::any('/pay/{paysys}/{key}/{amount}', function($paysys, $key, $amount) {
    $model = Goodoneuz\PayUz\Services\PaymentService::convertKeyToModel($key);
    $url = request('redirect_url', '/'); // Return URL post-payment
    
    (new Goodoneuz\PayUz\PayUz)
    	->driver($paysys)
    	->redirect($model, $amount, 860, $url);
});
```

### Laravel Telescope UI
Examine real-time requests, database queries, exceptions, and jobs:  
Access the deep diagnostic UI via: `https://your-domain.local/telescope`

---

## 🤝 Support the Development

If this boilerplate saved you valuable hours and provides you a great starting experience, please consider buying the author a coffee! ☕

<a href="https://payme.uz/@longevity" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important; width: 174px !important; box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" >
</a>

<br />

**Connect with me:**
- 🐙 [GitHub @IslomFargoniy](https://github.com/IslomFargoniy)
- 🦊 [GitLab @IslamAbdurahman](https://gitlab.com/islamabdurahman)
- ▶️ [YouTube - IslomFargniy](https://www.youtube.com/@IslomFargniy)
- ✈️ [Telegram - IslomFargniy](https://t.me/IslomFargniy)

---

## 🛡 Vulnerabilities & Security
If you stumble upon any security-related flaw within this codebase, please contact the maintainer directly at **abdurahmanislam304@gmail.com** rather than using the issue tracker.

## 📄 Licensing & Open Source
This bespoke open-source starter kit inherits the robust **[MIT License](LICENSE.md)**. Play around, build big things, and share with the world! 🌍
