<?php

namespace App\Support;

use Illuminate\Http\Request;

class Pagination
{
    public static function perPage(Request $request, int $default = 10, int $max = 100): int
    {
        $value = (int) $request->input('per_page', $default);

        return max(1, min($value > 0 ? $value : $default, $max));
    }
}
