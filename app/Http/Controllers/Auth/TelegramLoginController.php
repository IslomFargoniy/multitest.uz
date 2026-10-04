<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TelegramLoginController extends Controller
{
    public function handle(Request $request, \App\Services\Telegram\TelegramAuthValidator $validator)
    {
        // Telegram sends user info via POST
        $data = $request->all();

        // Validate Telegram login
        if (!$validator->validateWidgetData($data)) {
            return redirect()->route('dashboard')->with('error', 'Invalid Telegram login.');
        }

        // Create or update user
        $user = User::updateOrCreate(
            ['telegram_id' => $data['id']],
            [
                'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'username' => $data['username'] ?? null,
                'avatar' => $data['photo_url'] ?? null
            ]
        );

        // Assign default role only if the user was just created
        if ($user->wasRecentlyCreated) {
            $user->assignRole('Student');
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
