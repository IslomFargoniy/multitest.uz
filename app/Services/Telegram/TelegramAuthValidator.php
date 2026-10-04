<?php

namespace App\Services\Telegram;

class TelegramAuthValidator
{
    public function __construct(private ?string $botToken = null)
    {
        $this->botToken ??= (string) config('services.telegram.bot_token');
    }

    /**
     * Validate Telegram Mini App initData and return the verified user array.
     *
     * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     */
    public function validateInitData(string $initData): ?array
    {
        if ($this->botToken === '' || $initData === '') {
            return null;
        }

        parse_str($initData, $params);
        $hash = $params['hash'] ?? null;
        unset($params['hash']);

        if (!is_string($hash) || $hash === '') {
            return null;
        }

        ksort($params);
        $lines = [];
        foreach ($params as $key => $value) {
            if (!is_string($value)) {
                return null;
            }
            $lines[] = $key . '=' . $value;
        }

        $secret = hash_hmac('sha256', $this->botToken, 'WebAppData', true);
        $expected = hash_hmac('sha256', implode("\n", $lines), $secret);

        if (!hash_equals($expected, $hash) || !$this->isFresh($params['auth_date'] ?? null)) {
            return null;
        }

        $user = json_decode($params['user'] ?? '', true);

        return is_array($user) && isset($user['id']) ? $user : null;
    }

    /**
     * Validate Telegram Login Widget data.
     */
    public function validateWidgetData(array $data): bool
    {
        $hash = $data['hash'] ?? null;
        unset($data['hash']);

        if ($this->botToken === '' || !is_string($hash) || !$this->isFresh($data['auth_date'] ?? null)) {
            return false;
        }

        $lines = [];
        foreach ($data as $key => $value) {
            if (!is_scalar($value)) {
                return false;
            }
            $lines[] = $key . '=' . $value;
        }
        sort($lines);

        $secret = hash('sha256', $this->botToken, true);

        return hash_equals(hash_hmac('sha256', implode("\n", $lines), $secret), $hash);
    }

    private function isFresh(mixed $authDate): bool
    {
        if (!is_numeric($authDate)) {
            return false;
        }

        $maxAge = (int) config('services.telegram.auth_max_age', 86400);

        return time() - (int) $authDate <= $maxAge && (int) $authDate <= time() + 60;
    }
}
