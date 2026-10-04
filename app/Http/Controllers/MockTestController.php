<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMockTestRequest;
use App\Models\Mock;
use App\Models\MockTest;
use App\Models\Test;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MockTestController extends Controller
{
    public function store(StoreMockTestRequest $request)
    {
        $mock = Mock::findOrFail($request->mock_id);
        $this->authorize('update', $mock);

        $testIds = array_unique($request->testIds);
        $visible = Test::query()->visibleTo($request->user())->whereIn('id', $testIds)->pluck('id')->all();

        if (count($visible) !== count($testIds)) {
            throw ValidationException::withMessages(['testIds' => ['One or more selected tests are not available.']]);
        }

        DB::transaction(function () use ($mock, $testIds) {
            foreach ($testIds as $testId) {
                MockTest::firstOrCreate(['mock_id' => $mock->id, 'test_id' => $testId]);
            }
        });

        return redirect()->back()->with('success', 'Mock Tests added successfully');
    }

    public function destroy(MockTest $mockTest)
    {
        $this->authorize('update', $mockTest->mock);

        $mockTest->delete();

        return redirect()->back()->with('success', 'Mock Test deleted successfully');
    }
}
