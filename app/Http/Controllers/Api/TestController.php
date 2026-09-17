<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Get paginated tests with filters
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $languageId = $request->input('language_id');

        $tests = Test::query()
            ->with(['language'])
            ->where('is_public', true)
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($languageId, function ($query, $languageId) {
                $query->where('language_id', $languageId);
            })
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tests->items(),
            'meta' => [
                'current_page' => $tests->currentPage(),
                'last_page' => $tests->lastPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
            ],
        ]);
    }

    /**
     * Get single test with parts and questions
     */
    public function show($id)
    {
        $test = Test::with([
            'language',
            'parts.questions' => function ($query) {
                $query->select('id', 'part_id', 'textarea', 'audio_path', 'ready_second', 'answer_second');
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $test,
        ]);
    }
}
