<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Services\Telegram\MultitestUzBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MultitestUzBotController extends Controller
{
    public function __construct(protected MultitestUzBotService $telegramService)
    {
    }

    public function handle(Request $request)
    {
        $update = $request->all();

        Log::info('Telegram update received', [
            'update_id' => $update['update_id'] ?? null,
            'type' => isset($update['callback_query']) ? 'callback_query' : (isset($update['message']) ? 'message' : 'other'),
        ]);

        // 1. Inline button clicks
        if (isset($update['callback_query'])) {
            $callbackQuery = $update['callback_query'];
            $message = $callbackQuery['message'] ?? [];
            $fromId = $callbackQuery['from']['id'] ?? null;

            if ($fromId && ($message['chat']['type'] ?? 'private') === 'private') {
                $this->telegramService->handleCallbackQuery(
                    $update,
                    (string) ($callbackQuery['data'] ?? ''),
                    $fromId,
                    $callbackQuery['id'] ?? null
                );
            }

            return response('OK', 200);
        }

        $message = $update['message'] ?? null;
        $fromId = $message['from']['id'] ?? null;

        // Only private chats with a real sender are handled; the sender id is the account key.
        if (!$message || !$fromId || ($message['chat']['type'] ?? null) !== 'private') {
            return response('OK', 200);
        }

        if (isset($message['text'])) {
            $this->telegramService->handleCommand($update, trim($message['text']), $fromId);
        } else {
            $this->telegramService->sendWelcomeMessage($update, $fromId);
        }

        return response('OK', 200);
    }
}
