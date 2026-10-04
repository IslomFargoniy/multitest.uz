<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\Test;
use App\Support\Pagination;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => __('error.generic'),
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
        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => __('error.generic'),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Language $language)
    {
        try {
            $per_page = Pagination::perPage($request, 25);

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

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }
}
