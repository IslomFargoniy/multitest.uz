<?php

namespace App\Services\Telegram;

use App\Models\Mock;
use App\Models\User\User;
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
     * Handle bot commands (/start, /help, /mocks)
     */
    public function handleCommand(array $update, string $command, int|string $chatId): void
    {
        $parts = explode(' ', $update['message']['text']);
        $command = strtolower($parts[0]); // '/start'
        $params = array_slice($parts, 1); // ['12345']

        match ($command) {
            '/start' => $this->sendWelcomeMessage($update, $chatId),
            '/code', '/login', '/otp' => $this->handleOtpRequest($update, $chatId),
            '/help' => $this->sendHelpMessage($chatId),
            '/mocks' => $this->sendMockMessage($chatId),
            '/ref' => $this->sendRefMessage($chatId),
            default => $this->sendUnknownCommand($chatId),
        };
    }

    /**
     * Handle OTP request from user for Android / Mobile login
     */
    public function handleOtpRequest(array $update, int|string $chatId): void
    {
        $from = $update['message']['from'] ?? [];
        $user = User::query()->updateOrCreate(
            ['telegram_id' => $chatId],
            [
                'name' => trim(($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? '')) ?: 'User',
                'username' => $from['username'] ?? null,
                'avatar' => $from['photo_url'] ?? null,
            ]
        );

        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        $this->createAndSendOtp($user, $chatId, ['android' => true]);
    }

    /**
     * Generate and send 6-digit OTP code to user
     */
    public function createAndSendOtp(User $user, int|string $chatId, array $flags = []): string
    {
        // 1. Check existing active 6-digit OTP
        $otp = \App\Models\Otp::query()
            ->where('user_id', $user->id)
            ->where('expired', false)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if ($otp && strlen((string)$otp->code) === 6) {
            $code = (string) $otp->code;
        } else {
            \App\Models\Otp::query()
                ->where('user_id', $user->id)
                ->where('expired', false)
                ->update(['expired' => true]);

            do {
                $code = (string) random_int(100000, 999999);
            } while (\App\Models\Otp::query()->where('code', $code)->where('expired', false)->where('expired_at', '>', now())->exists());

            \App\Models\Otp::query()->create([
                'user_id' => $user->id,
                'code' => $code,
                'expired_at' => now()->addMinutes(2),
                'expired' => false,
                'is_android' => $flags['android'] ?? true,
                'is_ios' => $flags['ios'] ?? false,
                'is_mobile' => true,
                'is_email' => $flags['email'] ?? false,
            ]);
        }

        $platform = ($flags['ios'] ?? false) ? "iOS" : "Android";

        try {
            $this->telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => "🔐 *{$platform} Tasdiqlash kodi*\n\n" .
                          "👉 `{$code}`\n\n" .
                          "⏳ Ushbu kod 2 daqiqa davomida amal qiladi.\n" .
                          "MultiTest ilovasiga qaytib kodni kiriting.",
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Exception $e) {
            \Log::error('Telegram OTP send error: ' . $e->getMessage());
        }

        return $code;
    }

    /**
     * /help command
     */
    protected function sendHelpMessage(int|string $chatId): void
    {
        $this->telegram->sendMessage([
            'chat_id' => $chatId,
            'text' => "📘 Mavjud buyruqlar:\n/start - MultiTestni ochish\n/code - Android ilova uchun kirish kodi olish\n/mocks - Mock imtihonlar\n/ref - Referral havolangiz",
        ]);
    }

    /**
     * Unknown command handler
     */
    protected function sendUnknownCommand(int|string $chatId): void
    {
        $this->telegram->sendMessage([
            'chat_id' => $chatId,
            'text' => "Unknown command 😅. Type /help for available options.",
        ]);
    }

    /**
     * /start command — Welcome with WebApp button
     */
    public function sendWelcomeMessage($update, int|string $chatId): void
    {

        $from = $update['message']['from'] ?? [];

        $ref_telegram_id = isset($update['message']['text']) && str_starts_with($update['message']['text'], '/start ')
            ? trim(str_replace('/start ', '', $update['message']['text']))
            : null;

        $user = User::query()
            ->updateOrCreate(
                ['telegram_id' => $chatId],
                [
                    'name' => ($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? ''),
                    'username' => $from['username'] ?? null,
                    'avatar' => $from['photo_url'] ?? null,
                    'ref_telegram_id' => $ref_telegram_id,
                ]
            );

        // Assign default role only if the user was just created
        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        // 1. Set persistent “Open Multitest” button at the bottom (outside bot chat)
        $this->setPersistentMenuButton();

        // 2. Inline keyboard inside message
        $keyboard = Keyboard::make()
            ->inline()
            ->row([
                Keyboard::inlineButton([
                    'text' => 'Open Multitest 🎓',
                    'web_app' => ['url' => 'https://multitest.uz/test'],
                ]),
            ]);

        $this->sendSafeMessage(
            $chatId,
            "👋 Welcome to Multitest!\nClick below to open the app:",
            $keyboard
        );

        if (!$ref_telegram_id) {
            $this->sendRefMessage($chatId);
        }

        $this->telegram->setMyCommands([
            'commands' => [
                [
                    'command' => 'start',
                    'description' => 'Open Multitest.uz 🎓'
                ],
                [
                    'command' => 'mocks',
                    'description' => 'Open active mock tests'
                ],
                [
                    'command' => 'ref',
                    'description' => 'Get your referral link'
                ],
                [
                    'command' => 'help',
                    'description' => 'Show help and available commands'
                ],
            ],
        ]);


    }

    /**
     * /mocks command — Active mock tests list
     */
    public function sendMockMessage(int|string $chatId): void
    {
        $user = User::where('telegram_id', $chatId)->first();
        if (!$user) {
            $this->sendSafeMessage($chatId, "❗ Iltimos, avvalo Multitest botiga /start buyrug'i orqali kiring.");
            return;
        }

        $mocks = Mock::query()
            ->where('finished_at', '>', now())
            ->whereHas('user', function ($query) use ($user) {
                $query->where('telegram_id', '=', $user->ref_telegram_id);
            })
            ->get(['name', 'slug']);

        if ($mocks->isEmpty()) {
            $this->sendSafeMessage($chatId, "😕 Hozircha faol mock testlar mavjud emas.");
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

        $this->sendSafeMessage(
            $chatId,
            "🧠 Quyidagi faol mock testlardan birini tanlang:",
            $keyboard
        );
    }

    public function sendRefMessage(int|string $chatId): void
    {
        $this->sendSafeMessage(
            $chatId,
            "Your referral link: https://t.me/MultitestUzBot?start={$chatId}"
        );
    }

    /**
     * Safe message sender (catches Telegram API errors)
     */
    protected function sendSafeMessage(int|string $chatId, string $text, Keyboard $keyboard = null): void
    {
        try {
            $params = [
                'chat_id' => $chatId,
                'text' => $text,
            ];
            if ($keyboard) {
                $params['reply_markup'] = $keyboard;
            }
            $this->telegram->sendMessage($params);
        } catch (\Exception $e) {
            \Log::error('Telegram sendMessage error: ' . $e->getMessage());
        }
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

        $studentName = $attempt->mockStudent?->name ?? $attempt->user?->name ?? 'Talaba';
        $testName = $attempt->mock?->name ?? $attempt->test?->name ?? 'Imtihon';
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

        try {
            $this->telegram->sendMessage([
                'chat_id' => $telegramId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'reply_markup' => $keyboard,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send telegram attempt result notification: ' . $e->getMessage());
        }
    }

    /**
     * 🔹 Add persistent web app button (like Telegram Wallet)
     */
    public function setPersistentMenuButton(): void
    {
        try {
            $this->telegram->setChatMenuButton([
                'menu_button' => [
                    'type' => 'web_app',
                    'text' => 'Open Multitest 🎓',
                    'web_app' => [
                        'url' => 'https://multitest.uz',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to set persistent menu button: ' . $e->getMessage());
        }
    }
}
