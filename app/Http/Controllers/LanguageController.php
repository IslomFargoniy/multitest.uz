<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLanguageRequest;
use App\Http\Requests\UpdateLanguageRequest;
use App\Models\Language;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function allJson()
    {
        try {

            $languages = Language::query();
            $languages = $languages->get();

            return response()->json([
                'status' => 'success',
                'data' => $languages,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    public function sidebarJson()
    {
        try {

            $languages = Language::query()
                ->withCount([
                    'tests' => function ($query) {
                        $query->where('is_public', true);
                    },
                ])
                ->whereHas('tests', function ($query) {
                    $query->where(function ($query) {
                        $query->where('is_public', true)
                            ->orWhere('user_id', '=', Auth::id());
                    });
                });

            $languages = $languages->get();

            return response()->json([
                'status' => 'success',
                'data' => $languages,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

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
    public function store(StoreLanguageRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Language $language)
    {
        try {
            $per_page = \App\Support\Pagination::perPage($request, 25);

            $testQuery = Test::query()
                ->with([
                    'language',
                    'parts',
                    'user:id,name,avatar',
                ])
                ->where('language_id', '=', $language->id);

            if ($request->search) {
                $search = $request->search;
                $testQuery->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            }

            $testQuery->visibleTo(Auth::user());

            $test = $testQuery->paginate($per_page);

            if ($request->wantsJson()) {
                return response()->json($test);
            }

            return Inertia::render('language/index', [
                'test' => $test,
                'language' => $language,
            ]);

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
     * Show the form for editing the specified resource.
     */
    public function edit(Language $language)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLanguageRequest $request, Language $language)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Language $language)
    {
        //
    }
}
