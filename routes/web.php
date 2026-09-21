<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/webapp-login', [\App\Http\Controllers\Auth\TelegramAuthController::class, 'login']);
Route::post('/mock-student/enter', [\App\Http\Controllers\MockStudentController::class, 'enter'])->name('mock-student.enter');

Route::any('/bot/MultitestUzBot/webhook', [\App\Http\Controllers\Telegram\MultitestUzBotController::class, 'handle']);

// 📱 Android App Deep Link Redirect
Route::get('/app/open', function (Request $request) {
    $otp = $request->query('otp', '');
    $schemeUrl = 'multitest://auth?otp=' . urlencode($otp);
    $html = <<<HTML
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MultiTest Ilovasini ochish</title>
    <script>
        setTimeout(function() {
            window.location.href = "{$schemeUrl}";
        }, 100);
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #0b0f19;
            color: #ffffff;
            text-align: center;
            padding: 24px;
            box-sizing: border-box;
        }
        .card {
            background: #1e293b;
            padding: 32px 24px;
            border-radius: 20px;
            max-width: 360px;
            width: 100%;
            border: 1px solid #334155;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #ffffff;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .code {
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 4px;
            color: #818cf8;
            background: #0f172a;
            padding: 10px 20px;
            border-radius: 10px;
            display: inline-block;
            margin-top: 14px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="margin-top:0;">📱 MultiTest Ilovasi</h2>
        <p style="color:#94a3b8; font-size:14px; margin-bottom: 8px;">Ilova avtomatik ochilmasa, quyidagi tugmani bosing:</p>
        <div class="code">{$otp}</div>
        <div>
            <a href="{$schemeUrl}" class="btn">Ilovada ochish</a>
        </div>
    </div>
</body>
</html>
HTML;
    return response($html);
})->name('app.open');

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
    Route::post('practice-attempt-violation/{attempt_id}', [\App\Http\Controllers\PracticeController::class, 'recordViolation'])->name('practice-attempt-violation');
});

Route::get('certificate/verify/{attempt}', [\App\Http\Controllers\CertificateController::class, 'verify'])->name('certificate.verify');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

Route::get('/auth/github', [\App\Http\Controllers\Auth\GithubAuthController::class, 'redirect'])->name('github.redirect');
Route::get('/auth/github/callback', [\App\Http\Controllers\Auth\GithubAuthController::class, 'callback'])->name('github.callback');

Route::any('/auth/telegram/callback', [\App\Http\Controllers\Auth\TelegramLoginController::class, 'handle'])->name('telegram.callback');

Route::get('/lang/{locale}', function ($locale) {
    if (!in_array($locale, ['en', 'uz', 'ru'])) {
        abort(400);
    }
    session(['locale' => $locale]);
    app()->setLocale($locale);
    return back();
});

//handle requests from payment system
Route::any('/handle/{paysys}', function ($paysys) {
    (new Goodoneuz\PayUz\PayUz)->driver($paysys)->handle();
});

//redirect to payment system or payment form
Route::any('/pay/{paysys}/{key}/{amount}', function ($paysys, $key, $amount) {
    $model = Goodoneuz\PayUz\Services\PaymentService::convertKeyToModel($key);
    $url = request('redirect_url', '/'); // redirect url after payment completed
    $pay_uz = new Goodoneuz\PayUz\PayUz;
    $pay_uz
        ->driver($paysys)
        ->redirect($model, $amount, 860, $url);
});
