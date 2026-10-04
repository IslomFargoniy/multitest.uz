<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\Mock;
use App\Models\MockStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MockStudentController extends Controller
{
    /**
     * Store new student candidates for a mock (Single or Bulk names)
     */
    public function store(Request $request)
    {
        $request->validate([
            'mock_id' => 'required|exists:mocks,id',
            'names' => 'required|string', // Single name or newline/comma separated names
            'phone' => 'nullable|string',
        ]);

        $mock = Mock::findOrFail($request->mock_id);

        if (!Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $createdCount = 0;

        DB::transaction(function () use ($mock, $request, &$createdCount) {
            $nameList = preg_split('/[\r\n,]+/', $request->names);
            foreach ($nameList as $rawName) {
                $name = trim($rawName);
                if (empty($name)) continue;

                MockStudent::create([
                    'mock_id' => $mock->id,
                    'name' => $name,
                    'code' => MockStudent::generateUniqueCode(),
                    'phone' => $request->phone ?? null,
                    'attended' => false,
                ]);

                $createdCount++;
            }
        });

        if ($createdCount === 0) {
            return back()->with('error', "Hech qanday o'quvchi qo'shilmadi.");
        }

        return back()->with('success', "{$createdCount} ta o'quvchi muvaffaqiyatli qo'shildi!");
    }

    /**
     * Delete candidate student
     */
    public function destroy(MockStudent $mockStudent)
    {
        $mock = $mockStudent->mock;
        if (!Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $mockStudent->delete();
        return back()->with('success', "O'quvchi o'chirildi.");
    }

    /**
     * Public endpoint for candidates entering mock exam via Candidate Code (MSXXXXXXXX)
     */
    public function enter(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = strtoupper(trim($request->code));

        $student = MockStudent::with(['mock.test.parts'])->where('code', $code)->first();

        if (!$student) {
            throw ValidationException::withMessages([
                'code' => ["Kiritilgan kod ({$code}) topilmadi!"],
            ]);
        }

        $mock = $student->mock;

        if (!$mock || $mock->active != 1) {
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test hozirda faol emas!"],
            ]);
        }

        $now = now();
        $startTime = $mock->started_at ?? $mock->starts_at;

        if ($startTime && $now->lt(\Carbon\Carbon::parse($startTime))) {
            $formattedStart = \Carbon\Carbon::parse($startTime)->format('d.m.Y H:i');
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test hali boshlanmagan! Boshlanish vaqti: {$formattedStart}"],
            ]);
        }

        if ($mock->finished_at && $now->gt(\Carbon\Carbon::parse($mock->finished_at))) {
            $formattedFinish = \Carbon\Carbon::parse($mock->finished_at)->format('d.m.Y H:i');
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock test vaqti tugagan! Yakunlangan vaqti: {$formattedFinish}"],
            ]);
        }

        // Mark candidate as attended
        if (!$student->attended) {
            $student->attended = true;
            $student->save();
        }

        // Safely resolve test
        $test = $mock->test;
        if (!$test && $mock->mock_tests()->exists()) {
            $test = $mock->mock_tests()->with('test.parts')->first()?->test;
            if ($test) {
                $mock->test_id = $test->id;
                $mock->save();
            }
        }

        if (!$test) {
            throw ValidationException::withMessages([
                'code' => ["Ushbu Mock testga hali test biriktirilmagan. Iltimos, o'qituvchiga murojaat qiling."],
            ]);
        }

        // Get or create attempt
        $attempt = Attempt::where('mock_student_id', $student->id)->first();

        if (!$attempt) {
            \Illuminate\Support\Facades\DB::beginTransaction();
            try {
                $attempt = Attempt::create([
                    'name' => $student->name,
                    'mock_id' => $student->mock_id,
                    'mock_student_id' => $student->id,
                    'user_id' => Auth::check() ? Auth::id() : null,
                    'test_id' => $test->id,
                    'started_at' => now(),
                ]);

                if ($test->parts && $test->parts->isNotEmpty()) {
                    $attemptParts = $test->parts->map(function ($part) {
                        return [
                            'part_id' => $part->id,
                            'started_at' => now(),
                        ];
                    })->toArray();

                    $attempt->attempt_parts()->createMany($attemptParts);
                }

                \Illuminate\Support\Facades\DB::commit();
            } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {
                throw $e;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                \Illuminate\Support\Facades\Log::error('MockStudent enter failed to create attempt: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'code' => ["Imtihonni boshlashda xatolik yuz berdi: " . $e->getMessage()],
                ]);
            }
        }

        // Save session for guest student candidate access
        session([
            'mock_student_id' => $student->id,
            'mock_attempt_id' => $attempt->id,
        ]);

        return redirect()->route('practice.index', ['attempt' => $attempt->id]);
    }
}
