<?php

use App\Http\Controllers\Admin\PlayStoreTesterController;
use App\Http\Controllers\AttemptController;
use App\Http\Controllers\AttemptPartController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\TelegramAuthController;
use App\Http\Controllers\Auth\TelegramLoginController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MockController;
use App\Http\Controllers\MockStudentController;
use App\Http\Controllers\MockTestController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\PracticeController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Telegram\MultitestUzBotController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\User\UserController;
use App\Http\Middleware\EnsureCandidateOrAuthenticated;
use App\Http\Middleware\VerifyTelegramWebhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/webapp-login', [TelegramAuthController::class, 'login'])->middleware('throttle:tg-login');
Route::post('/mock-student/enter', [MockStudentController::class, 'enter'])->middleware('throttle:candidate-code')->name('mock-student.enter');

Route::post('/bot/MultitestUzBot/webhook', [MultitestUzBotController::class, 'handle'])
    ->middleware(VerifyTelegramWebhook::class);

// 📱 Android App Deep Link Redirect
Route::get('/app/open', function (Request $request) {
    $otp = (string) $request->query('otp', '');
    abort_unless(preg_match('/^\d{6}$/', $otp) === 1, 404);

    return response()->view('app-open', ['otp' => $otp, 'schemeUrl' => 'multitest://auth?otp='.$otp]);
})->middleware('throttle:otp')->name('app.open');

// 🗺️ SEO Sitemap
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/', [HomeController::class, 'index'])->name('home.index');
Route::view('/privacy', 'privacy')->name('privacy');
Route::get('/landing-page-tests', [HomeController::class, 'landingPageTests'])->name('landing-page-tests');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

    Route::get('role-all-json', [RoleController::class, 'allJson'])->name('role.all.json');

    Route::resource('user', UserController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::get('play-store-testers', [PlayStoreTesterController::class, 'index'])->name('play-store-testers.index');
    Route::get('play-store-testers/export', [PlayStoreTesterController::class, 'exportCsv'])->name('play-store-testers.export');
    Route::get('play-store-testers/export-zip', [PlayStoreTesterController::class, 'exportZip'])->name('play-store-testers.export_zip');
    Route::post('play-store-testers/send-email', [PlayStoreTesterController::class, 'sendEmail'])->name('play-store-testers.send_email');
    Route::resource('test', TestController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::resource('language', LanguageController::class)->only(['show']);
    Route::get('test-all-json', [TestController::class, 'allJson'])->name('test.all.json');
    Route::get('language-all-json', [LanguageController::class, 'allJson'])->name('language.all.json');
    Route::get('sidebar-language-json', [LanguageController::class, 'sidebarJson'])->name('sidebar.language.json');

    // Plural route aliases to prevent 404s from plural URLs
    Route::redirect('tests', '/test');
    Route::redirect('attempts', '/attempt');
    Route::redirect('mocks', '/mock');
    Route::redirect('users', '/user');
    Route::get('tests/{test}', fn($test) => redirect("/test/{$test}"));
    Route::get('attempts/{attempt}', fn($attempt) => redirect("/attempt/{$attempt}"));

    Route::resource('part', PartController::class)->only(['store', 'update', 'destroy']);
    Route::resource('question', QuestionController::class)->only(['store', 'update', 'destroy']);
    Route::resource('mock', MockController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::post('/mock-student', [MockStudentController::class, 'store'])->name('mock-student.store');
    Route::delete('/mock-student/{mockStudent}', [MockStudentController::class, 'destroy'])->name('mock-student.destroy');

    Route::resource('mock-test', MockTestController::class)->only(['store', 'destroy']);
    Route::resource('attempt', AttemptController::class)->only(['index', 'show', 'store', 'destroy']);
    Route::get('attempt/{attempt}/certificate', [CertificateController::class, 'download'])->name('attempt.certificate');

    Route::post('attempt/{attempt}/evaluate', [AttemptController::class, 'evaluate'])->name('attempt.evaluate');
    Route::post('attempt_parts/{attempt_part}/re-evaluate', [AttemptPartController::class, 'reEvaluate'])->name('attempt_part.re_evaluate');
    Route::post('attempt/{attempt}/re-evaluate', [AttemptController::class, 'reEvaluate'])->name('attempt.re_evaluate');

});

// Candidate or logged in student practice access
Route::middleware([EnsureCandidateOrAuthenticated::class])->group(function () {
    Route::get('practice/{attempt}', [PracticeController::class, 'index'])->name('practice.index');
    Route::get('practice/attempt_part/{attempt_part}', [PracticeController::class, 'show'])->name('practice.show');
    Route::post('practice/attempt_part/{attempt_part}/save', [PracticeController::class, 'save_answers'])->name('practice.save_answers');
    Route::post('practice-attempt-violation/{attempt}', [PracticeController::class, 'recordViolation'])->name('practice-attempt-violation');
});

Route::get('certificate/verify/{code}', [CertificateController::class, 'verify'])->name('certificate.verify');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

Route::any('/auth/telegram/callback', [TelegramLoginController::class, 'handle'])->middleware('throttle:tg-login')->name('telegram.callback');

Route::get('/lang/{locale}', function ($locale) {
    if (! in_array($locale, ['en', 'uz', 'ru'])) {
        abort(400);
    }
    session(['locale' => $locale]);
    app()->setLocale($locale);

    return back();
});
