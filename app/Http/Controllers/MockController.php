<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMockRequest;
use App\Http\Requests\UpdateMockRequest;
use App\Models\Mock;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MockController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Mock::class);

        $per_page = $request->per_page === 'all' ? 100 : min((int)($request->per_page ?? 10), 100);

        $mock = Mock::with([
            'students.attempt',
            'test',
            'user:id,name',
        ]);

        if ($request->search) {
            $mock->where(function ($query) use ($request) {
                $query->where('name', 'like', "%$request->search%")
                    ->orWhere('comment', 'like', "%$request->search%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%$request->search%");
                    })
                    ->orWhereHas('test', function ($q) use ($request) {
                        $q->where('name', 'like', "%$request->search%");
                    });
            });
        }

        if ($request->from && $request->to) {
            $mock->whereBetween('created_at', [$request->from, $request->to . ' 23:59:59']);
        }

        if ($request->user_id) {
            $mock->where('user_id', $request->user_id);
        }

        if ($request->teacher_id) {
            $mock->where('user_id', $request->teacher_id);
        }

        if ($request->test_id) {
            $mock->where('test_id', $request->test_id);
        }

        if (Auth::user()->hasRole('Admin')) {
            // Admin can see everything
        } elseif (Auth::user()->hasRole('Teacher')) {
            // Teacher can see their own mocks
            $mock->where('user_id', Auth::id());
        } else {
            // Students see active mocks
            $mock->where('active', 1);
        }

        $mock = $mock->select('id', 'test_id', 'user_id', 'name', 'comment', 'active', 'started_at', 'finished_at', 'created_at')
            ->orderBy('id', 'desc')
            ->paginate($per_page);

        // Filter tests based on role for search dropdowns
        $tests_query = Test::query()->select('id', 'name');

        if (Auth::user()->hasRole('Teacher')) {
            $tests_query->where('user_id', Auth::id());
        }

        $teachers = Auth::user()->hasRole('Admin')
            ? \App\Models\User\User::whereHas('roles', function ($q) {
                $q->where('name', 'Teacher');
            })->select('id', 'name')->get()
            : [];

        return Inertia::render('mock/index', [
            'mock' => $mock,
            'tests' => $tests_query->limit(100)->get(),
            'users' => [],
            'teachers' => $teachers,
            'isAdmin' => Auth::user()->hasRole('Admin'),
            'filters' => $request->only(['search', 'teacher_id', 'user_id', 'test_id', 'from', 'to', 'per_page']),
        ]);
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
    public function store(StoreMockRequest $request)
    {
        try {
            $this->authorize('create', Mock::class);

            $data = $request->validated();
            $data['starts_at'] = $data['started_at'] ?? now();

            Mock::create($data);

            return back()->with('success', __('success.mock_created') ?? 'Mock test muvaffaqiyatli yaratildi');
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Mock $mock)
    {
        $this->authorize('view', $mock);

        $mock->load([
            'test',
            'user:id,name',
            'students.attempt',
            'attempts.user',
            'attempts.mockStudent',
            'attempts.attempt_parts',
        ]);

        return Inertia::render('mock/show', [
            'mock' => $mock,
            'isAdmin' => Auth::user()->hasRole('Admin'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Mock $mock)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMockRequest $request, Mock $mock)
    {
        try {
            $this->authorize('update', $mock);

            $data = $request->validated();
            if (isset($data['started_at'])) {
                $data['starts_at'] = $data['started_at'];
            }

            $mock->update($data);
            return back()->with('success', __('success.mock_updated') ?? 'Mock test muvaffaqiyatli yangilandi');
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mock $mock)
    {
        try {
            $this->authorize('delete', $mock);

            \Illuminate\Support\Facades\DB::transaction(function () use ($mock) {
                // Detach/nullify attempts so history is preserved without FK error
                \App\Models\Attempt::where('mock_id', $mock->id)->update(['mock_id' => null]);
                // Delete associated mock students
                $mock->students()->delete();
                // Delete the mock
                $mock->delete();
            });

            return redirect()->route('mock.index')->with('success', __('success.mock_deleted') ?? "Mock o'chirildi");
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->route('mock.index')->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }
}
