<?php

namespace App\Console\Commands;

use App\Services\Telegram\MultitestUzBotService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TelegramSetupCommand extends Command
{
    protected $signature = 'telegram:setup {--url= : Public webhook URL (defaults to APP_URL/bot/MultitestUzBot/webhook)}';

    protected $description = 'Register the Telegram webhook (with secret token), bot commands and the menu button';

    public function handle(): int
    {
        $token = (string) config('services.telegram.bot_token');
        $secret = (string) config('services.telegram.webhook_secret');

        if ($token === '' || $secret === '') {
            $this->error('Set MultitestUzBot_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env first.');

            return self::FAILURE;
        }

        $url = $this->option('url') ?: rtrim((string) config('app.url'), '/').'/bot/MultitestUzBot/webhook';

        $response = Http::post("https://api.telegram.org/bot{$token}/setWebhook", [
            'url' => $url,
            'secret_token' => $secret,
            'allowed_updates' => ['message', 'callback_query'],
            'drop_pending_updates' => false,
        ]);

        if (! $response->ok() || ! $response->json('ok')) {
            $this->error('setWebhook failed: '.($response->json('description') ?? $response->status()));

            return self::FAILURE;
        }
        $this->info("Webhook set to {$url}");

        // Resolved only now: the service constructor needs a valid bot token.
        $bot = app(MultitestUzBotService::class);
        $bot->registerBotCommandsSafely();
        $bot->setPersistentMenuButton();
        $this->info('Bot commands and menu button registered.');

        return self::SUCCESS;
    }
}
