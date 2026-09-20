<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Services\Telegram\MultitestUzBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MultitestUzBotController extends Controller
{
    protected MultitestUzBotService $telegramService;

    public function __construct(MultitestUzBotService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    public function handle(Request $request)
    {
        Log::info('Webhook received:', $request->all());

        $update = $request->all();

        // 1. Handle Callback Query (Inline Button clicks)
        if (isset($update['callback_query'])) {
            $callbackQuery = $update['callback_query'];
            $chatId = $callbackQuery['message']['chat']['id'] ?? ($callbackQuery['from']['id'] ?? null);
            $data = $callbackQuery['data'] ?? '';
            $callbackQueryId = $callbackQuery['id'] ?? null;

            if ($chatId) {
                $this->telegramService->handleCallbackQuery($update, $data, $chatId, $callbackQueryId);
            }
            return response('OK', 200);
        }

        // 2. Handle Text Message / Commands / Deep links
        if (isset($update['message']['text'])) {
            $chatId = $update['message']['chat']['id'];
            $text = trim($update['message']['text']);

            $this->telegramService->handleCommand($update, $text, $chatId);
            return response('OK', 200);
        }

        // 3. Handle Other messages (e.g. photos, contacts, start without text)
        if (isset($update['message']['chat']['id'])) {
            $chatId = $update['message']['chat']['id'];
            $this->telegramService->sendWelcomeMessage($update, $chatId);
        }

        return response('OK', 200);
    }
}
