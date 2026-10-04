<?php

namespace App\Http\Controllers;

use App\Models\Mock;
use App\Models\MockStudent;
use App\Services\MockEntryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        if (! Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $createdCount = 0;

        DB::transaction(function () use ($mock, $request, &$createdCount) {
            $nameList = preg_split('/[\r\n,]+/', $request->names);
            foreach ($nameList as $rawName) {
                $name = trim($rawName);
                if (empty($name)) {
                    continue;
                }

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
        if (! Auth::user()->hasRole('Admin') && $mock->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $mockStudent->delete();

        return back()->with('success', "O'quvchi o'chirildi.");
    }

    /**
     * Public endpoint for candidates entering mock exam via Candidate Code (MSXXXXXXXX)
     */
    public function enter(Request $request, MockEntryService $entry)
    {
        $request->validate([
            'code' => 'required|string|max:32',
        ]);

        [$student, $attempt] = $entry->enter($request->code, Auth::user());

        // Save session for guest student candidate access
        session([
            'mock_student_id' => $student->id,
            'mock_attempt_id' => $attempt->id,
        ]);

        return redirect()->route('practice.index', ['attempt' => $attempt->id]);
    }
}
