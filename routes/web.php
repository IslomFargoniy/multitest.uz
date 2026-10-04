<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/webapp-login', [\App\Http\Controllers\Auth\TelegramAuthController::class, 'login'])->middleware('throttle:tg-login');
Route::post('/mock-student/enter', [\App\Http\Controllers\MockStudentController::class, 'enter'])->middleware('throttle:candidate-code')->name('mock-student.enter');

Route::post('/bot/MultitestUzBot/webhook', [\App\Http\Controllers\Telegram\MultitestUzBotController::class, 'handle'])
    ->middleware(\App\Http\Middleware\VerifyTelegramWebhook::class);

// 📱 Android App Deep Link Redirect
Route::get('/app/open', function (Request $request) {
    $otp = (string) $request->query('otp', '');
    abort_unless(preg_match('/^\d{6}$/', $otp) === 1, 404);

    return response()->view('app-open', ['otp' => $otp, 'schemeUrl' => 'multitest://auth?otp=' . $otp]);
})->middleware('throttle:otp')->name('app.open');

// 🗺️ SEO Sitemap
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');

Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home.index');
Route::get('/landing-page-tests', [\App\Http\Controllers\HomeController::class, 'landingPageTests'])->name('landing-page-tests');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [\App\Http\Controllers\HomeController::class, 'dashboard'])->name('dashboard');

    Route::get('role-all-json', [\App\Http\Controllers\RoleController::class, 'allJson'])->name('role.all.json');

    Route::resource('user', \App\Http\Controllers\User\UserController::class);
    Route::resource('test', \App\Http\Controllers\TestController::class);
    Route::resource('language', \App\Http\Controllers\LanguageController::class);
    Route::get('test-all-json', [\App\Http\Controllers\TestController::class, 'allJson'])->name('test.all.json');
    Route::get('language-all-json', [\App\Http\Controllers\LanguageController::class, 'allJson'])->name('language.all.json');
    Route::get('sidebar-language-json', [\App\Http\Controllers\LanguageController::class, 'sidebarJson'])->name('sidebar.language.json');

    Route::resource('part', \App\Http\Controllers\PartController::class);
    Route::resource('question', \App\Http\Controllers\QuestionController::class);
    Route::resource('mock', \App\Http\Controllers\MockController::class);
    Route::post('/mock-student', [\App\Http\Controllers\MockStudentController::class, 'store'])->name('mock-student.store');
    Route::delete('/mock-student/{mockStudent}', [\App\Http\Controllers\MockStudentController::class, 'destroy'])->name('mock-student.destroy');

    Route::resource('mock-test', \App\Http\Controllers\MockTestController::class);
    Route::resource('attempt', \App\Http\Controllers\AttemptController::class);
    Route::get('attempt/{attempt}/certificate', [\App\Http\Controllers\CertificateController::class, 'download'])->name('attempt.certificate');

    Route::post('attempt/{attempt}/evaluate', [\App\Http\Controllers\AttemptController::class, 'evaluate'])->name('attempt.evaluate');
    Route::post('attempt_parts/{attempt_part}/re-evaluate', [\App\Http\Controllers\AttemptPartController::class, 'reEvaluate'])->name('attempt_part.re_evaluate');
    Route::post('attempt/{attempt}/re-evaluate', [\App\Http\Controllers\AttemptController::class, 'reEvaluate'])->name('attempt.re_evaluate');

});

// Candidate or logged in student practice access
Route::middleware([\App\Http\Middleware\EnsureCandidateOrAuthenticated::class])->group(function () {
    Route::get('practice/{attempt}', [\App\Http\Controllers\PracticeController::class, 'index'])->name('practice.index');
    Route::get('practice/attempt_part/{attempt_part}', [\App\Http\Controllers\PracticeController::class, 'show'])->name('practice.show');
    Route::post('practice/attempt_part/{attempt_part}/save', [\App\Http\Controllers\PracticeController::class, 'save_answers'])->name('practice.save_answers');
    Route::post('practice-attempt-violation/{attempt}', [\App\Http\Controllers\PracticeController::class, 'recordViolation'])->name('practice-attempt-violation');
});

Route::get('certificate/verify/{code}', [\App\Http\Controllers\CertificateController::class, 'verify'])->name('certificate.verify');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');


Route::any('/auth/telegram/callback', [\App\Http\Controllers\Auth\TelegramLoginController::class, 'handle'])->middleware('throttle:tg-login')->name('telegram.callback');

Route::get('/lang/{locale}', function ($locale) {
    if (! in_array($locale, ['en', 'uz', 'ru'])) {
        abort(400);
    }
    session(['locale' => $locale]);
    app()->setLocale($locale);

    return back();
});
