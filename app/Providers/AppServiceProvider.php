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

        \Illuminate\Support\Facades\Gate::policy(User::class, \App\Policies\UserPolicy::class);

        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            return $user->hasRole('Admin') ? true : null;
        });
    }
}
