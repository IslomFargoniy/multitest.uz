<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <script src="https://telegram.org/js/telegram-web-app.js"></script>

        <script>
            if (window.Telegram && window.Telegram.WebApp) {
                const WebApp = window.Telegram.WebApp;
                WebApp.ready();

                // Always expand (safe for both mobile & desktop)
                WebApp.expand();

                // Fullscreen only on laptop/desktop
                if (WebApp.platform === "web" || WebApp.platform === "tdesktop") {
                    WebApp.requestFullscreen();
                }
            }
        </script>

        {{-- 🔑 Laravel CSRF token --}}
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @laravelPWA

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Multitest.uz') }} - CEFR va IELTS Speaking AI Simulyatori | UzBMB Mock Test</title>

        <!-- Primary Meta Tags -->
        <meta name="title" content="Multitest.uz - CEFR va IELTS Speaking AI Simulyatori | UzBMB Mock Test">
        <meta name="description" content="O'zbekistondagi 1-raqamli AI tizimli CEFR (Multilevel) va IELTS Speaking simulyatori. Haqiqiy UzBMB (DTM) imtihon muhiti, lahzali B1, B2, C1 baholash va to'liq tahlil.">
        <meta name="keywords" content="multitest, cefr mock test, multilevel speaking, ielts speaking uzbekistan, uzbmb milliy sertifikat, dtm cefr test, speaking mock test online, ai speaking tester, ingliz tili cefr">
        <meta name="author" content="Multitest.uz">
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <link rel="canonical" href="https://multitest.uz">
        <link rel="alternate" hreflang="uz" href="https://multitest.uz">
        <link rel="alternate" hreflang="ru" href="https://multitest.uz">
        <link rel="alternate" hreflang="en" href="https://multitest.uz">
        <link rel="alternate" hreflang="x-default" href="https://multitest.uz">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Multitest.uz">
        <meta property="og:url" content="https://multitest.uz">
        <meta property="og:title" content="Multitest.uz - CEFR va IELTS Speaking AI Simulyatori">
        <meta property="og:description" content="O'zbekistondagi birinchi sun'iy intellektli CEFR va IELTS Speaking simulyatori. Rasmiy UzBMB mezonlari asosida B1, B2, C1 darajalaringizni hoziroq aniqlang.">
        <meta property="og:image" content="https://multitest.uz/images/logo/logo.png">
        <meta property="og:locale" content="uz_UZ">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://multitest.uz">
        <meta property="twitter:title" content="Multitest.uz - CEFR & IELTS AI Speaking Mock Test">
        <meta property="twitter:description" content="Sun'iy intellekt yordamida CEFR Speaking imtihoniga tayyorlaning va natijangizni lahzada oling.">
        <meta property="twitter:image" content="https://multitest.uz/images/logo/logo.png">

        <!-- Structured Data / JSON-LD -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "EducationalOrganization",
              "@id": "https://multitest.uz/#organization",
              "name": "Multitest.uz",
              "url": "https://multitest.uz",
              "logo": {
                "@type": "ImageObject",
                "url": "https://multitest.uz/images/logo/logo.png",
                "width": "512",
                "height": "512"
              },
              "description": "O'zbekistondagi birinchi AI tizimli CEFR (Multilevel) va IELTS Speaking simulyatori.",
              "sameAs": [
                "https://t.me/MultitestUzBot",
                "https://t.me/IslomFargniy"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://multitest.uz/#website",
              "url": "https://multitest.uz",
              "name": "Multitest.uz",
              "publisher": {
                "@id": "https://multitest.uz/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://multitest.uz/test?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "WebApplication",
              "@id": "https://multitest.uz/#webapp",
              "name": "Multitest.uz CEFR & IELTS Speaking AI Simulator",
              "url": "https://multitest.uz",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "UZS"
              }
            },
            {
              "@type": "FAQPage",
              "@id": "https://multitest.uz/#faq",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Multitest.uz orqali qanday qilib bepul mock test topshirish mumkin?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Platformada ro'yxatdan o'tganingizdan so'ng, istalgan ochiq CEFR yoki IELTS Speaking testini tanlab, to'g'ridan-to'g'ri brauzer yoki mobil ilovada mikrofon orqali testni topshirishingiz mumkin."
                  }
                },
                {
                  "@type": "Question",
                  "name": "AI baholash tizimi qanchalik aniq va ishonchli?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Bizning AI baholash tizimimiz UzBMB (DTM) va CEFR rasmiy mezonlari (Fluency, Lexical Resource, Grammar, Pronunciation) asosida ishlaydi va 95%+ aniqlikda real imtihon ballini ko'rsatadi."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Multilevel (Milliy sertifikat) Speaking imtihoni qanday qismlardan iborat?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "UzBMB Multilevel Speaking 3 ta asosiy qismdan iborat: Part 1 (Suhbat va umumiy savollar), Part 2 (Rasm va vaziyat solishtirish), Part 3 (Mavzu bo'yicha chuqur munozara)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Telegram bot orqali kirsa bo'ladimi?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ha, @MultitestUzBot orqali bir tugma bilan Telegram WebApp rejimida yoki OTP kod orqali tizimga kirishingiz mumkin."
                  }
                }
              ]
            }
          ]
        }
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased overflow-x-hidden">
        @inertia
    </body>
</html>
