<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Get current user profile and exam statistics
     */
    public function profile()
    {
        $user = Auth::user();

        $totalAttempts = Attempt::where('user_id', $user->id)->count();
        $completedAttempts = Attempt::where('user_id', $user->id)->whereNotNull('finished_at')->count();
        $averageScore = Attempt::where('user_id', $user->id)->whereNotNull('score')->avg('score');
        if (!$averageScore) {
            $avgAi = \Illuminate\Support\Facades\DB::table('attempts')
                ->join('attempt_parts', 'attempts.id', '=', 'attempt_parts.attempt_id')
                ->join('attempt_answers', 'attempt_parts.id', '=', 'attempt_answers.attempt_part_id')
                ->where('attempts.user_id', $user->id)
                ->whereNotNull('attempt_answers.score_ai')
                ->avg('attempt_answers.score_ai');
            if ($avgAi) {
                $averageScore = $avgAi;
            }
        }

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
                'created_at' => $user->created_at->format('Y-m-d'),
                'stats' => [
                    'total_attempts' => $totalAttempts,
                    'completed_attempts' => $completedAttempts,
                    'average_score' => $averageScore ? round($averageScore, 1) : null,
                ],
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $this->fileUploadService->uploadImage($request->file('avatar'), 'avatars');
        }

        $user->update(array_filter($data));

        return response()->json([
            'success' => true,
            'data' => $user->fresh(),
            'message' => 'Profil ma’lumotlari yangilandi.',
        ]);
    }
}
