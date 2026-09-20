<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {

        if ($request->slug) {
            $mock = \App\Models\Mock::query()
                ->with([

                ])
                ->where('slug', $request->slug)->where('open', true)
                ->first();
            if ($mock) {
                return Inertia::render('welcome', [
                    'mock' => $mock,
                ]);
            }
        }

        return Inertia::render('welcome');

    }

    public function landingPageTests(Request $request)
    {
        $tests = \App\Models\Test::query()
            ->where('is_public', true)
            ->with(['language', 'parts'])
            ->withCount('attempts')
            ->orderByDesc('id')
            ->take(6)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $tests,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = User::query()
            ->with([
                'last_attempt' => function ($query) {
                    $query->with([
                        'attempt_parts' => function ($query) {
                            $query->withSum('attempt_answers as score_ai', 'score_ai')
                                ->withCount('attempt_answers as total_questions');
                        },
                    ]);
                },
                'attempts' => function ($query) {
                    $query->whereYear('finished_at', now()->year)
                        ->whereMonth('finished_at', now()->month)
                        ->orderBy('finished_at', 'asc')
                        ->with([
                            'attempt_parts' => function ($query) {
                                $query->withSum('attempt_answers as score_ai', 'score_ai')
                                    ->withCount('attempt_answers as total_questions');
                            },
                        ]);
                },
            ])
            ->find(Auth::id());

        // ── Admin Only Stats ───────────────────────────────────────────────
        $daily_users = [];
        $daily_attempts = [];
        $hourly_attempts = [];
        $today_hourly_attempts = [];
        $weekly_attempts = [];

        if (Auth::user()->hasRole('Admin')) {
            $stats = Cache::remember('admin_dashboard_stats', 300, function () {
                // ── Daily users: last 30 days
                $daily_users_data = User::query()
                    ->selectRaw('DATE(created_at) as day_date, COUNT(*) as items_count, COUNT(DISTINCT id) as unique_users_count')
                    ->where('created_at', '>=', now()->subDays(30)->startOfDay())
                    ->groupBy('day_date')
                    ->having('items_count', '>', 0)
                    ->orderBy('day_date')
                    ->get();

                // ── Daily attempts: last 30 days
                $daily_attempts_data = Attempt::query()
                    ->selectRaw('DATE(created_at) as day_date, COUNT(*) as items_count, COUNT(DISTINCT user_id) as unique_users_count')
                    ->where('created_at', '>=', now()->subDays(30)->startOfDay())
                    ->groupBy('day_date')
                    ->having('items_count', '>', 0)
                    ->orderBy('day_date')
                    ->get();

                // ── Hourly attempts: all-time
                $hourly_attempts_data = Attempt::query()
                    ->selectRaw('HOUR(created_at) as hour, COUNT(*) as items_count')
                    ->groupBy('hour')
                    ->having('items_count', '>', 0)
                    ->orderBy('hour')
                    ->get();

                // ── Hourly attempts: today only
                $today_hourly_attempts_data = Attempt::query()
                    ->selectRaw('HOUR(created_at) as hour, COUNT(*) as items_count')
                    ->whereDate('created_at', now()->toDateString())
                    ->groupBy('hour')
                    ->having('items_count', '>', 0)
                    ->orderBy('hour')
                    ->get();

                // ── Weekly attempts: Monday=1 … Sunday=7
                $weekly_attempts_data = Attempt::query()
                    ->selectRaw('MOD(DAYOFWEEK(created_at) + 5, 7) + 1 as weekday, COUNT(*) as items_count')
                    ->groupBy('weekday')
                    ->having('items_count', '>', 0)
                    ->orderBy('weekday')
                    ->get();

                return [
                    'daily_users' => $daily_users_data,
                    'daily_attempts' => $daily_attempts_data,
                    'hourly_attempts' => $hourly_attempts_data,
                    'today_hourly_attempts' => $today_hourly_attempts_data,
                    'weekly_attempts' => $weekly_attempts_data,
                ];
            });

            $daily_users = $stats['daily_users'];
            $daily_attempts = $stats['daily_attempts'];
            $hourly_attempts = $stats['hourly_attempts'];
            $today_hourly_attempts = $stats['today_hourly_attempts'];
            $weekly_attempts = $stats['weekly_attempts'];
        }

        return Inertia::render('dashboard', [
            'user'                  => $user,
            'daily_users'           => $daily_users,
            'daily_attempts'        => $daily_attempts,
            'hourly_attempts'       => $hourly_attempts,
            'today_hourly_attempts' => $today_hourly_attempts,
            'weekly_attempts'       => $weekly_attempts,
        ]);

    }
}
