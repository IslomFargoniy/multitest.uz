<?php

namespace App\Services\Telegram;

use App\Models\Mock;
use App\Models\Otp;
use App\Models\User\User;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Api;
use Telegram\Bot\Keyboard\Keyboard;

class MultitestUzBotService
{
    protected Api $telegram;

    public function __construct()
    {
        $this->telegram = new Api(config('services.telegram.bot_token'));
    }

    /**
     * Handle bot commands (/start, /code, /help, /mocks, etc.)
     */
    public function handleCommand(array $update, string $text, int|string $chatId): void
    {
        $parts = explode(' ', trim($text));
        $command = strtolower($parts[0] ?? '');
        $payload = strtolower($parts[1] ?? '');

        // 1. Deep linking OTP requests (prava24 style)
        if ($command === '/start' && in_array($payload, ['is_android_otp', 'is_ios_otp', 'is_email_otp', 'code', 'login', 'otp', 'android', 'app'])) {
            $from = $update['message']['from'] ?? [];
            $user = $this->getOrCreateUser($chatId, $from);
            $isIos = $payload === 'is_ios_otp';
            $this->createAndSendOtp($user, $chatId, [
                'android' => !$isIos,
                'ios' => $isIos,
                'email' => $payload === 'is_email_otp',
            ]);
            return;
        }

        // 2. Standard command match
        switch ($command) {
            case '/start':
                $this->sendWelcomeMessage($update, $chatId);
                break;
            case '/code':
            case '/login':
            case '/otp':
            case '/android':
            case 'kod':
            case 'kirish':
            case 'parol':
            case 'code':
            case 'login':
            case 'otp':
                $this->handleOtpRequest($update, $chatId);
                break;
            case '/help':
                $this->sendHelpMessage($chatId);
                break;
            case '/mocks':
                $this->sendMockMessage($chatId);
                break;
            case '/ref':
                $this->sendRefMessage($chatId);
                break;
            default:
                $this->sendWelcomeMessage($update, $chatId);
                break;
        }
    }

    /**
     * Handle Telegram Inline Button callbacks (callback_query)
     */
    public function handleCallbackQuery(array $update, string $data, int|string $chatId, ?string $callbackQueryId = null): void
    {
        if ($callbackQueryId) {
            try {
                $this->telegram->answerCallbackQuery([
                    'callback_query_id' => $callbackQueryId,
                    'text' => '✅ Kod yangilandi',
                ]);
            } catch (\Throwable $e) {
                Log::warning('Telegram answerCallbackQuery failed: ' . $e->getMessage());
            }
        }

        switch ($data) {
            case 'get_otp':
            case 'refresh_otp':
                $this->handleOtpRequest($update, $chatId);
                break;
            case 'mocks':
                $this->sendMockMessage($chatId);
                break;
            case 'help':
                $this->sendHelpMessage($chatId);
                break;
            default:
                $this->handleOtpRequest($update, $chatId);
                break;
        }
    }

    /**
     * Handle OTP request from user for Android / Mobile login
     */
    public function handleOtpRequest(array $update, int|string $chatId): void
    {
        $from = $update['message']['from'] ?? ($update['callback_query']['from'] ?? []);
        $user = $this->getOrCreateUser($chatId, $from);

        $this->createAndSendOtp($user, $chatId, ['android' => true]);
    }

    /**
     * Generate and send 6-digit OTP code to user with 1-tap copy (panel.prava24.uz style)
     */
    public function createAndSendOtp(User $user, int|string $chatId, array $flags = []): string
    {
        // 1. Avval userning aktiv 6 xonali OTP sini tekshiramiz
        $otp = Otp::query()
            ->where('user_id', $user->id)
            ->where('expired', false)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if ($otp && strlen((string)$otp->code) === 6) {
            $code = (string) $otp->code;
        } else {
            Otp::query()
                ->where('user_id', $user->id)
                ->where('expired', false)
                ->update(['expired' => true]);

            do {
                $code = (string) random_int(100000, 999999);
            } while (Otp::query()->where('code', $code)->where('expired', false)->where('expired_at', '>', now())->exists());

            Otp::query()->create([
                'user_id' => $user->id,
                'code' => $code,
                'expired_at' => now()->addMinutes(5), // 5 daqiqa
                'expired' => false,
                'is_android' => $flags['android'] ?? true,
                'is_ios' => $flags['ios'] ?? false,
                'is_mobile' => true,
                'is_email' => $flags['email'] ?? false,
            ]);
        }

        $mobile = ($flags['ios'] ?? false) ? "iPhone" : "Android";

        $message = "🔐 *{$mobile} Tasdiqlash kodi*\n\n" .
                   "👉 `{$code}`\n\n" .
                   "⏳ Kod 5 daqiqa davomida amal qiladi.\n" .
                   "MultiTest ilovasiga qaytib, ushbu kodni kiriting.";

        $keyboard = Keyboard::make()->inline();
        $keyboard->row([
            Keyboard::inlineButton([
                'text' => '📱 MultiTest Ilovasida ochish',
                'url' => "https://multitest.uz/app/open?otp={$code}",
            ]),
            Keyboard::inlineButton([
                'text' => '🔄 Yangi kod',
                'callback_data' => 'get_otp',
            ]),
        ]);

        $this->sendSafeMessage($chatId, $message, $keyboard, true);

        return $code;
    }

    /**
     * /start command — Welcome with WebApp button (panel.prava24.uz style)
     */
    public function sendWelcomeMessage($update, int|string $chatId): void
    {
        $from = $update['message']['from'] ?? ($update['callback_query']['from'] ?? []);
        $text = $update['message']['text'] ?? '';

        $ref_telegram_id = str_starts_with($text, '/start ') && is_numeric(trim(str_replace('/start ', '', $text)))
            ? trim(str_replace('/start ', '', $text))
            : null;

        $user = $this->getOrCreateUser($chatId, $from, $ref_telegram_id);

        // Try setting persistent menu button (graceful fallback)
        $this->setPersistentMenuButton();

        // Register default bot commands
        $this->registerBotCommandsSafely();

        $userName = htmlspecialchars($user->name ?: 'Foydalanuvchi', ENT_QUOTES, 'UTF-8');

        $welcomeText = "👋 <b>Assalomu alaykum, {$userName}!</b>\n\n" .
                       "🎓 <b>MultiTest</b> — Speaking va Mock Imtihonlar platformasining rasmiy botiga xush kelibsiz!\n\n" .
                       "Ushbu bot orqali testlarni to'g'ridan-to'g'ri Telegram ichida (Web App) ishlashingiz yoki Android ilovasi uchun tasdiqlash kodini olishingiz mumkin.\n\n" .
                       "👇 <b>Platformani ochish uchun quyidagi tugmani bosing:</b>";

        $keyboard = Keyboard::make()->inline();
        $keyboard->row([
            Keyboard::inlineButton([
                'text' => '🎓 MultiTest platformasini ochish',
                'web_app' => ['url' => 'https://multitest.uz/test'],
            ]),
        ]);
        $keyboard->row([
            Keyboard::inlineButton([
                'text' => '🔑 Android ilovaga kirish (OTP)',
                'callback_data' => 'get_otp',
            ]),
            Keyboard::inlineButton([
                'text' => '🧪 Mock testlar',
                'callback_data' => 'mocks',
            ]),
        ]);

        $this->sendSafeHtmlMessage($chatId, $welcomeText, $keyboard);
    }

    /**
     * Get or create User model from Telegram data
     */
    protected function getOrCreateUser(int|string $chatId, array $from, ?string $refTelegramId = null): User
    {
        $fullName = trim(($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? ''));
        if (empty($fullName)) {
            $fullName = $from['username'] ?? 'User';
        }

        $user = User::query()
            ->updateOrCreate(
                ['telegram_id' => $chatId],
                array_filter([
                    'name' => $fullName,
                    'username' => $from['username'] ?? null,
                    'avatar' => $from['photo_url'] ?? null,
                    'ref_telegram_id' => $refTelegramId,
                ], fn($v) => !is_null($v))
            );

        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        return $user;
    }

    /**
     * /help command
     */
    public function sendHelpMessage(int|string $chatId): void
    {
        $text = "📘 <b>MultiTest Bot Buyruqlari:</b>\n\n" .
                "🔑 <b>/code</b> — Android ilova uchun 6 xonali tasdiqlash kodi\n" .
                "🎓 <b>/start</b> — MultiTest platformasini ochish\n" .
                "🧪 <b>/mocks</b> — Faol mock testlar ro'yxati\n" .
                "👥 <b>/ref</b> — Shaxsiy referral havolangiz";

        $keyboard = Keyboard::make()->inline();
        $keyboard->row([
            Keyboard::inlineButton([
                'text' => '🔑 Kirish kodini olish (OTP)',
                'callback_data' => 'get_otp',
            ]),
        ]);

        $this->sendSafeHtmlMessage($chatId, $text, $keyboard);
    }

    /**
     * /mocks command — Active mock tests list
     */
    public function sendMockMessage(int|string $chatId): void
    {
        $user = User::where('telegram_id', $chatId)->first();
        if (!$user) {
            $this->sendSafeHtmlMessage($chatId, "❗ Iltimos, avvalo botga /start buyrug'i orqali kiring.");
            return;
        }

        $mocks = Mock::query()
            ->where('finished_at', '>', now())
            ->whereHas('user', function ($query) use ($user) {
                $query->where('telegram_id', '=', $user->ref_telegram_id);
            })
            ->get(['name', 'slug']);

        if ($mocks->isEmpty()) {
            $keyboard = Keyboard::make()->inline();
            $keyboard->row([
                Keyboard::inlineButton([
                    'text' => '🎓 Barcha testlarni ko\'rish',
                    'web_app' => ['url' => 'https://multitest.uz/test'],
                ]),
            ]);
            $this->sendSafeHtmlMessage($chatId, "😕 Hozircha faol mock testlar mavjud emas.", $keyboard);
            return;
        }

        $keyboard = Keyboard::make()->inline();

        foreach ($mocks as $mock) {
            $keyboard->row([
                Keyboard::inlineButton([
                    'text' => "🧪 {$mock->name}",
                    'web_app' => [
                        'url' => "https://multitest.uz?slug={$mock->slug}",
                    ],
                ]),
            ]);
        }

        $this->sendSafeHtmlMessage(
            $chatId,
            "🧠 <b>Quyidagi faol mock testlardan birini tanlang:</b>",
            $keyboard
        );
    }

    /**
     * /ref command — Referral link
     */
    public function sendRefMessage(int|string $chatId): void
    {
        $refUrl = "https://t.me/MultitestUzBot?start={$chatId}";
        $text = "👥 <b>Sizning referral havolangiz:</b>\n\n" .
                "👉 <code>{$refUrl}</code>\n\n" .
                "Ushbu havola orqali do'stlaringizni taklif qiling!";

        $this->sendSafeHtmlMessage($chatId, $text);
    }

    /**
     * Send attempt result notification to user via Telegram
     */
    public function sendAttemptResultNotification(\App\Models\Attempt $attempt): void
    {
        $attempt->loadMissing(['user', 'mock', 'mockStudent', 'test']);

        $telegramId = $attempt->user?->telegram_id;
        if (!$telegramId) {
            return;
        }

        $studentName = htmlspecialchars($attempt->mockStudent?->name ?? $attempt->user?->name ?? 'Talaba', ENT_QUOTES, 'UTF-8');
        $testName = htmlspecialchars($attempt->mock?->name ?? $attempt->test?->name ?? 'Imtihon', ENT_QUOTES, 'UTF-8');
        $score = $attempt->score ?? ($attempt->ai_score_avg ? number_format($attempt->ai_score_avg, 1) : 'Tayyor');
        $tabViolations = $attempt->tab_switch_count ?? 0;
        $attemptUrl = route('attempt.show', $attempt->id);
        $certificateUrl = route('certificate.verify', $attempt->id);

        $text = "🎉 <b>Tabriklaymiz, natijangiz tayyor!</b>\n\n"
            . "👤 <b>Nomzod:</b> {$studentName}\n"
            . "📝 <b>Imtihon:</b> {$testName}\n"
            . "⭐️ <b>Natija (Ball):</b> <b>{$score}</b>\n";

        if ($tabViolations > 0) {
            $text .= "⚠️ <b>Qoidabuzarliklar:</b> {$tabViolations} ta tab almashtirish\n";
        }

        $text .= "\nBatafsil tahlil va sertifikatni ko'rish uchun quyidagi tugmalardan foydalaning:";

        $keyboard = Keyboard::make()->inline();
        $keyboard->row([
            Keyboard::inlineButton([
                'text' => '📊 Natijani ko\'rish',
                'url' => $attemptUrl,
            ]),
            Keyboard::inlineButton([
                'text' => '📜 Sertifikat',
                'url' => $certificateUrl,
            ]),
        ]);

        $this->sendSafeHtmlMessage($telegramId, $text, $keyboard);
    }

    /**
     * Safe message sender supporting HTML or Markdown parse mode (panel.prava24.uz style)
     */
    protected function sendSafeMessage(
        int|string $chatId,
        string $text,
        ?Keyboard $keyboard = null,
        bool $markdown = false
    ): void {
        try {
            $params = [
                'chat_id' => $chatId,
                'text' => $text,
                'disable_web_page_preview' => true,
            ];
            if ($keyboard) {
                $params['reply_markup'] = $keyboard;
            }
            if ($markdown) {
                $params['parse_mode'] = 'Markdown';
            } else {
                $params['parse_mode'] = 'HTML';
            }
            $this->telegram->sendMessage($params);
        } catch (\Throwable $e) {
            Log::error('Telegram sendMessage error: ' . $e->getMessage());
            // Fallback: try sending plain message without keyboard if keyboard had issue
            if ($keyboard) {
                try {
                    $plainParams = [
                        'chat_id' => $chatId,
                        'text' => $text,
                        'disable_web_page_preview' => true,
                    ];
                    if ($markdown) {
                        $plainParams['parse_mode'] = 'Markdown';
                    } else {
                        $plainParams['parse_mode'] = 'HTML';
                    }
                    $this->telegram->sendMessage($plainParams);
                } catch (\Throwable $e2) {
                    Log::error('Telegram sendMessage plain fallback error: ' . $e2->getMessage());
                }
            }
        }
    }

    protected function sendSafeHtmlMessage(int|string $chatId, string $text, ?Keyboard $keyboard = null): void
    {
        $this->sendSafeMessage($chatId, $text, $keyboard, false);
    }

    /**
     * Safely register bot commands with Telegram
     */
    protected function registerBotCommandsSafely(): void
    {
        try {
            $commands = [
                ['command' => 'start', 'description' => 'MultiTest platformasini ochish 🎓'],
                ['command' => 'code', 'description' => 'Android ilova kirish kodi (OTP) 🔑'],
                ['command' => 'mocks', 'description' => 'Faol mock testlar 🧪'],
                ['command' => 'ref', 'description' => 'Referral havola olish 👥'],
                ['command' => 'help', 'description' => 'Yordam va qo\'llanma 📘'],
            ];

            $this->telegram->setMyCommands([
                'commands' => json_encode($commands),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to register bot commands: ' . $e->getMessage());
        }
    }

    /**
     * Set persistent web app button (graceful fallback)
     */
    public function setPersistentMenuButton(): void
    {
        try {
            \Illuminate\Support\Facades\Http::post("https://api.telegram.org/bot" . config('services.telegram.bot_token') . "/setChatMenuButton", [
                'menu_button' => [
                    'type' => 'web_app',
                    'text' => 'Open Multitest 🎓',
                    'web_app' => [
                        'url' => 'https://multitest.uz',
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::info('Note: setChatMenuButton optional call: ' . $e->getMessage());
        }
    }
}
