<?php

namespace App\Http\Controllers;

use App\Models\MockTest;
use App\Http\Requests\StoreMockTestRequest;
use App\Http\Requests\UpdateMockTestRequest;
use Illuminate\Validation\ValidationException;

class MockTestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMockTestRequest $request)
    {
        try {

            foreach ($request->testIds as $testId) {
                MockTest::create([
                    'mock_id' => $request->mock_id,
                    'test_id' => $testId,
                ]);
            }

            return redirect()->back()->with('success', 'Mock Tests added successfully');

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(MockTest $mockTest)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MockTest $mockTest)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMockTestRequest $request, MockTest $mockTest)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MockTest $mockTest)
    {
        try {
            $mockTest->delete();
            return redirect()->back()->with('success', 'Mock Test deleted successfully');

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }
}
