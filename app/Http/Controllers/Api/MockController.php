<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mock;
use App\Models\MockStudent;
use App\Models\Attempt;
use App\Models\AttemptPart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MockController extends Controller
{
    /**
     * Join mock test by secret pin code
     */
    public function join(Request $request)
    {
        $request->validate([
            'pin' => 'required|string',
        ], [
            'pin.required' => 'Mock kodini kiriting',
        ]);

        $pin = trim($request->pin);

        $mock = Mock::with(['test.parts.questions', 'language'])
            ->where('code', $pin)
            ->where('is_active', true)
            ->first();

        if (!$mock) {
            return response()->json([
                'success' => false,
                'message' => 'Kiritilgan kod bo‘yicha faol Mock imtihon topilmadi.',
            ], 404);
        }

        if (!$mock->test || $mock->test->parts->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Ushbu imtihon uchun test savollari topilmadi.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            $mockStudent = MockStudent::updateOrCreate(
                [
                    'mock_id' => $mock->id,
                    'user_id' => Auth::id(),
                ],
                [
                    'name' => Auth::user()->name,
                    'phone' => Auth::user()->phone,
                ]
            );

            $attempt = Attempt::create([
                'user_id' => Auth::id(),
                'mock_id' => $mock->id,
                'mock_student_id' => $mockStudent->id,
                'test_id' => $mock->test_id,
                'name' => $mock->name,
                'started_at' => now(),
            ]);

            foreach ($mock->test->parts as $part) {
                AttemptPart::create([
                    'attempt_id' => $attempt->id,
                    'part_id' => $part->id,
                ]);
            }

            DB::commit();

            $attempt->load([
                'test.language',
                'mock',
                'attempt_parts.part.questions' => function ($query) {
                    $query->select('id', 'part_id', 'textarea', 'audio_path', 'ready_second', 'answer_second');
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $attempt,
                'message' => 'Mock imtihonga muvaffaqiyatli ulandingiz!',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
