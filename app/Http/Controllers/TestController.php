<?php

namespace App\Http\Controllers;

use App\Models\Test;
use App\Http\Requests\StoreTestRequest;
use App\Http\Requests\UpdateTestRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;
use Inertia\Inertia;

class TestController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function allJson(Request $request)
    {
        try {

            $tests = Test::query();

            if ($request->has('mock_id')) {
                $mock_id = $request->input('mock_id');
                $tests->whereDoesntHave('mock_tests', function ($query) use ($mock_id) {
                    $query->where('mock_id', $mock_id);
                });
            }

            $tests = $tests->get();

            return response()->json([
                'status' => 'success',
                'data' => $tests
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->per_page) {
                $per_page = $request->per_page;
            } else {
                $per_page = 25;
            }

            $testQuery = Test::query()
                ->with([
                    'language',
                    'parts',
                    'user:id,name,avatar',
                ]);

            if ($request->search) {
                $search = $request->search;
                $testQuery->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                });
            }

            if (Auth::user()->hasRole('Teacher')) {
                $testQuery->where('user_id', Auth::id());
            } elseif (Auth::user()->hasRole('Student')) {
                $testQuery->where('is_public', true);
            }


            $test = $testQuery->paginate($per_page);

            if ($request->wantsJson()) {
                return response()->json($test);
            }

            $seoData = [
                'og_image' => url('/images/og-image.png'), // Replace with actual OG image if available
            ];


            return Inertia::render('test/index', [
                'test' => $test,
                'seoData' => $seoData,
            ]);



        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
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
    public function store(StoreTestRequest $request)
    {
        try {
            if (!Auth::user()->hasRole('Admin')) {
                $userTestsCount = Auth::user()->tests()->count();
                if ($userTestsCount >= Auth::user()->create_test_limit) {
                    throw ValidationException::withMessages([
                        'error' => ["You have reached your test creation limit."],
                    ]);
                }
            }

            $data = $request->validated();

            if ($request->hasFile('audio_path')) {
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'tests/audio');
            } else {
                $data['audio_path'] = '/en/audio/test-intro.mp3';
            }

            Test::create($data);

            return redirect()->back()->with('success', 'Test created successfully.');
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
    public function show(Test $test)
    {
        try {

            $this->authorize('view', $test);

            return Inertia::render('test/show', [
                'test' => $test->load([
                    'user',
                    'parts' => function ($query) {
                        $query->with([
                            'questions'
                        ]);
                    },
                ]),
            ]);

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Test $test)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestRequest $request, Test $test)
    {
        try {
            $this->authorize('update', $test);
            $data = $request->validated();
            $oldFilePath = null;
            if ($request->hasFile('audio_path')) {
                $oldFilePath = $test->audio_path;
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'tests/audio');
            } else {
                $data['audio_path'] = $test->audio_path;
            }

            $test->update($data);

            if ($oldFilePath) {
                $this->fileUploadService->deleteFile($oldFilePath);
            }

            return redirect()->back()->with('success', 'Test updated successfully.');

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Test $test)
    {
        try {
            $this->authorize('delete', $test);
            $test->delete();

            if ($test->audio_path) {
                $this->fileUploadService->deleteFile($test->audio_path);
            }

            return redirect()->back()->with('success', 'Test deleted successfully.');
        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }
}
