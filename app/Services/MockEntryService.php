<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\MockStudent;
use App\Models\User\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Candidate entry into a mock exam by candidate code (shared by the web flow and the Android API).
 */
class MockEntryService
{
    /**
     * @return array{0: MockStudent, 1: Attempt}
     *
     * @throws ValidationException (field "code")
     */
    public function enter(string $code, ?User $user = null): array
    {
        $code = strtoupper(trim($code));

        $student = MockStudent::with(['mock.test.parts'])->where('code', $code)->first();

        if (! $student) {
            $this->fail("Kiritilgan kod ({$code}) topilmadi!");
        }

        $mock = $student->mock;

        if (! $mock || ! $mock->active) {
            $this->fail('Ushbu Mock test hozirda faol emas!');
        }

        $now = now();
        $start = $mock->started_at;

        if ($start && $now->lt($start)) {
            $this->fail('Ushbu Mock test hali boshlanmagan! Boshlanish vaqti: '.$start->format('Y-m-d H:i'));
        }

        if ($mock->finished_at && $now->gt($mock->finished_at)) {
            $this->fail('Ushbu Mock test vaqti tugagan! Yakunlangan vaqti: '.$mock->finished_at->format('Y-m-d H:i'));
        }

        $test = $mock->test;
        if (! $test) {
            $test = $mock->mock_tests()->with('test.parts')->first()?->test;
            if ($test) {
                $mock->test_id = $test->id;
                $mock->save();
            }
        }

        if (! $test) {
            $this->fail("Ushbu Mock testga hali test biriktirilmagan. Iltimos, o'qituvchiga murojaat qiling.");
        }

        $attempt = DB::transaction(function () use ($student, $mock, $test, $user) {
            $student = MockStudent::whereKey($student->id)->lockForUpdate()->first();

            if (! $student->attended) {
                $student->forceFill(['attended' => true])->save();
            }

            $attempt = Attempt::where('mock_student_id', $student->id)->first();

            if (! $attempt) {
                $attempt = Attempt::create([
                    'name' => $student->name,
                    'mock_id' => $mock->id,
                    'mock_student_id' => $student->id,
                    'user_id' => $user?->id,
                    'test_id' => $test->id,
                    'started_at' => now(),
                ]);

                if ($test->parts->isNotEmpty()) {
                    $attempt->attempt_parts()->createMany(
                        $test->parts->map(fn ($part) => ['part_id' => $part->id, 'started_at' => now()])->values()->toArray()
                    );
                }
            }

            return $attempt;
        });

        if ($user) {
            if ($attempt->user_id !== null && $attempt->user_id !== $user->id) {
                $this->fail('Ushbu kod boshqa foydalanuvchiga biriktirilgan.');
            }

            if ($attempt->user_id === null) {
                $attempt->update(['user_id' => $user->id]);
            }
        }

        return [$student, $attempt];
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['code' => [$message]]);
    }
}
