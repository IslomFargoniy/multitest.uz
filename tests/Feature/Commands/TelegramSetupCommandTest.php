<?php

namespace Tests\Feature\Commands;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramSetupCommandTest extends TestCase
{
    public function test_it_refuses_to_run_without_token_and_secret(): void
    {
        config(['services.telegram.bot_token' => '', 'services.telegram.webhook_secret' => '']);

        $this->artisan('telegram:setup')->assertFailed();
    }

    public function test_it_registers_webhook_with_secret_token(): void
    {
        config(['services.telegram.bot_token' => '1:T', 'services.telegram.webhook_secret' => 's3cret', 'app.url' => 'https://example.test']);
        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true])]);

        $this->artisan('telegram:setup')->assertSuccessful();

        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/setWebhook')
            && $request['secret_token'] === 's3cret'
            && $request['url'] === 'https://example.test/bot/MultitestUzBot/webhook'
            && $request['allowed_updates'] === ['message', 'callback_query']);
    }
}
