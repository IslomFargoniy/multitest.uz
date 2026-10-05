<?php

namespace App\Providers;

use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Models\Test;
use App\Models\User\User;
use App\Observers\AttemptAnswerObserver;
use App\Observers\QuestionObserver;
use App\Observers\TestObserver;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        AttemptAnswer::observe(AttemptAnswerObserver::class);
        Test::observe(TestObserver::class);
        Question::observe(QuestionObserver::class);

        $reviewerOtp = config('services.reviewer.otp');
        $reviewerCode = config('services.reviewer.candidate_code');

        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('otp', function (Request $r) use ($reviewerOtp) {
            if ($reviewerOtp && $r->input('otp') === $reviewerOtp) {
                return Limit::none();
            }
            return [
                Limit::perMinute(5)->by('otp|'.$r->ip()),
                Limit::perHour(30)->by('otp-h|'.$r->ip()),
            ];
        });
        RateLimiter::for('api-login', fn (Request $r) => Limit::perMinute(5)->by(strtolower((string) $r->input('email')).'|'.$r->ip()));
        RateLimiter::for('candidate-code', function (Request $r) use ($reviewerCode) {
            $code = strtoupper(trim((string) ($r->input('code') ?: $r->input('pin'))));
            if ($reviewerCode && $code === $reviewerCode) {
                return Limit::none();
            }
            return Limit::perMinute(10)->by('cand|'.$r->ip());
        });
        RateLimiter::for('tg-login', fn (Request $r) => Limit::perMinute(10)->by('tg|'.$r->ip()));

        Gate::policy(User::class, UserPolicy::class);

        Gate::before(function ($user, $ability) {
            return $user->hasRole('Admin') ? true : null;
        });
    }
}
