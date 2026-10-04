<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    /**
     * Login using 6-digit Telegram OTP
     */
    public function loginWithOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required',
        ], [
            'otp.required' => 'OTP kod kiritilmagan',
        ]);

        $otpCode = trim($request->otp);

        $otp = Otp::where('code', $otpCode)
            ->where('expired', false)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json([
                'success' => false,
                'data' => new \stdClass(),
                'message' => 'OTP noto‘g‘ri yoki muddati o‘tgan.',
            ], 400);
        }

        $userId = $otp->user_id;
        $otp->update(['expired' => true]);

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => new \stdClass(),
                'message' => 'Foydalanuvchi topilmadi.',
            ], 404);
        }

        $tokenId = Str::uuid()->toString();
        $token = $user->createToken($tokenId)->plainTextToken;
        $user->token = $token;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'roles' => $user->roles->pluck('name'),
                'token' => $token,
            ],
            'message' => 'OTP orqali muvaffaqiyatli login qilindi.',
        ]);
    }

    /**
     * Login using Google OAuth ID Token
     */
    public function loginWithGoogle(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ], [
            'id_token.required' => 'Google token kiritilmagan',
        ]);

        $allowedClientIds = config('services.google.allowed_client_ids', []);
        if (empty($allowedClientIds)) {
            return response()->json([
                'success' => false,
                'data' => new \stdClass(),
                'message' => 'Google orqali kirish hozircha sozlanmagan.',
            ], 503);
        }

        try {
            // Verify ID token with Google tokeninfo endpoint
            $response = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $request->id_token,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'data' => new \stdClass(),
                    'message' => 'Google autentifikatsiyasi tasdiqlanmadi yoki token muddati o‘tgan.',
                ], 400);
            }

            $googleData = $response->json();
            $googleId = $googleData['sub'] ?? null;
            $email = isset($googleData['email']) ? strtolower($googleData['email']) : null;
            $name = $googleData['name'] ?? ($googleData['given_name'] ?? 'Google User');
            $avatar = $googleData['picture'] ?? null;

            $validIssuer = in_array($googleData['iss'] ?? null, ['accounts.google.com', 'https://accounts.google.com'], true);
            $validAudience = in_array($googleData['aud'] ?? null, $allowedClientIds, true);
            $emailVerified = filter_var($googleData['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if (!$googleId || !$email || !$validIssuer || !$validAudience || !$emailVerified) {
                return response()->json([
                    'success' => false,
                    'data' => new \stdClass(),
                    'message' => 'Google profil ma’lumotlarini tasdiqlab bo‘lmadi.',
                ], 400);
            }

            // Find existing user by google_id first, then by (verified) email
            $user = User::where('google_id', $googleId)->first()
                ?? User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleId,
                    'avatar' => $user->avatar ?: $avatar,
                    'name' => $user->name ?: $name,
                ]);
            } else {
                $baseUsername = explode('@', $email)[0];
                $cleanUsername = preg_replace('/[^A-Za-z0-9_]/', '', $baseUsername) ?: 'user';
                $username = $cleanUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $cleanUsername . $counter++;
                }

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'username' => $username,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make(Str::random(24)),
                ]);

                $user->assignRole('Student');
            }

            $tokenId = Str::uuid()->toString();
            $token = $user->createToken($tokenId)->plainTextToken;
            $user->token = $token;

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'roles' => $user->roles->pluck('name'),
                    'token' => $token,
                ],
                'message' => 'Google orqali muvaffaqiyatli kirildi.',
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json([
                'success' => false,
                'data' => new \stdClass(),
                'message' => 'Google orqali kirishda xatolik yuz berdi.',
            ], 500);
        }
    }

    /**
     * Standard email/password login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->orWhere('username', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email yoki parol noto‘g‘ri.',
            ], 401);
        }

        $token = $user->createToken(Str::uuid()->toString())->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'roles' => $user->roles->pluck('name'),
                'token' => $token,
            ],
            'message' => 'Muvaffaqiyatli kirildi.',
        ]);
    }
}
