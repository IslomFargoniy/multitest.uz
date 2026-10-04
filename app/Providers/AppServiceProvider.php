<?php

namespace App\Providers;

use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Models\Test;
use App\Models\User\User;
use App\Observers\AttemptAnswerObserver;
use App\Observers\QuestionObserver;
use App\Observers\TestObserver;
use App\Observers\UserObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        app()->setLocale(session('locale', config('app.locale')));

        User::observe(UserObserver::class);
        AttemptAnswer::observe(AttemptAnswerObserver::class);
        Test::observe(TestObserver::class);
        Question::observe(QuestionObserver::class);

        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('otp', fn (Request $r) => [
            Limit::perMinute(5)->by('otp|' . $r->ip()),
            Limit::perHour(30)->by('otp-h|' . $r->ip()),
        ]);
        RateLimiter::for('api-login', fn (Request $r) => Limit::perMinute(5)->by(strtolower((string) $r->input('email')) . '|' . $r->ip()));
        RateLimiter::for('candidate-code', fn (Request $r) => Limit::perMinute(10)->by('cand|' . $r->ip()));
        RateLimiter::for('tg-login', fn (Request $r) => Limit::perMinute(10)->by('tg|' . $r->ip()));

        \Illuminate\Support\Facades\Gate::policy(User::class, \App\Policies\UserPolicy::class);

        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            return $user->hasRole('Admin') ? true : null;
        });
    }
}
