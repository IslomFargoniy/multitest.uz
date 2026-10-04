<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MockEntryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class MockController extends Controller
{
    /**
     * Join a mock exam with the candidate code (the Android "pin" field; "code" is accepted as an alias).
     */
    public function join(Request $request, MockEntryService $entry)
    {
        $request->validate([
            'pin' => 'required_without:code|nullable|string|max:32',
            'code' => 'nullable|string|max:32',
        ], [
            'pin.required_without' => 'Nomzod kodini kiriting',
        ]);

        try {
            [, $attempt] = $entry->enter((string) ($request->input('pin') ?: $request->input('code')), Auth::user());
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->errors()['code'][0] ?? 'Kod noto‘g‘ri.',
            ], 422);
        }

        if ($attempt->finished_at) {
            return response()->json([
                'success' => false,
                'message' => 'Siz ushbu imtihonni allaqachon topshirgansiz.',
            ], 422);
        }

        $attempt->load([
            'test.language',
            'mock:id,name,slug,active,started_at,finished_at',
            'attempt_parts.part.questions' => function ($query) {
                $query->select('id', 'part_id', 'textarea', 'audio_path', 'ready_second', 'answer_second');
            },
        ]);

        return response()->json([
            'success' => true,
            'data' => $attempt,
            'message' => 'Mock imtihonga muvaffaqiyatli ulandingiz!',
        ]);
    }
}
