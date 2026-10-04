<?php

namespace App\Support;

use Carbon\Carbon;
use Throwable;

class ClientTime
{
    /**
     * Parse a timestamp sent by a client (ISO-8601 with offset/Z, or a plain "Y-m-d H:i:s" in app time)
     * and return it in the application timezone. Falls back to "now" when missing or unparsable.
     */
    public static function parse(?string $value): Carbon
    {
        if ($value === null || trim($value) === '') {
            return now();
        }

        try {
            return Carbon::parse($value)->setTimezone(config('app.timezone'));
        } catch (Throwable) {
            return now();
        }
    }
}
