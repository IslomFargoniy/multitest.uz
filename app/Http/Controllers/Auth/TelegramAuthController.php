<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use App\Services\Telegram\TelegramAuthValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TelegramAuthController extends Controller
{
    public function login(Request $request, TelegramAuthValidator $validator)
    {
        $data = $request->validate([
            'init_data' => 'required|string|max:4096',
        ]);

        $tgUser = $validator->validateInitData($data['init_data']);

        if (!$tgUser) {
            return response()->json(['success' => false, 'message' => 'Invalid Telegram data.'], 403);
        }

        $user = User::firstOrNew(['telegram_id' => (string) $tgUser['id']]);

        $name = trim(($tgUser['first_name'] ?? '') . ' ' . ($tgUser['last_name'] ?? ''));
        $user->name = $name !== '' ? $name : ($tgUser['username'] ?? 'User');
        $user->username = $tgUser['username'] ?? $user->username;
        $user->avatar = $tgUser['photo_url'] ?? $user->avatar;
        $user->save();

        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'redirect' => route('dashboard'),
        ]);
    }
}
