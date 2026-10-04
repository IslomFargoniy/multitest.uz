<?php

use App\Models\Question;
use App\Support\HtmlSanitizer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('script, event handlers and javascript urls are removed', function () {
    $dirty = '<p onclick="x()">Hi</p><script>alert(1)</script><img src="/storage/a.png" onerror="alert(1)"><a href="javascript:alert(1)">l</a><iframe src="https://e.x"></iframe>';

    $clean = HtmlSanitizer::clean($dirty);

    expect($clean)->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('onerror')
        ->not->toContain('javascript:')
        ->not->toContain('iframe')
        ->toContain('<img src="/storage/a.png"');
});

test('editor formatting survives', function () {
    $html = '<p style="text-align:center"><strong>Bold</strong> <em>it</em></p><ul><li>a</li></ul><table><tbody><tr><td colspan="2">x</td></tr></tbody></table>';

    expect(HtmlSanitizer::clean($html))->toContain('<strong>Bold</strong>')->toContain('text-align:center')->toContain('<td colspan="2">');
});

test('question textarea is sanitized when saved', function () {
    $q = Question::factory()->create(['textarea' => '<p>ok</p><script>alert(1)</script>']);

    expect($q->fresh()->textarea)->not->toContain('script')->toContain('ok');
});

test('base64 svg and non-image payloads are dropped', function () {
    $svg = 'data:image/svg+xml;base64,'.base64_encode('<svg onload="alert(1)"/>');
    $q = Question::factory()->create(['textarea' => '<p>x</p><img src="'.$svg.'">']);

    expect($q->fresh()->textarea)->not->toContain('<img')->not->toContain('svg');
});
