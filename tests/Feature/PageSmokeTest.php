<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class PageSmokeTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_main_pages_render_for_teacher_and_student(): void
    {
        foreach ([$this->teacher(), $this->student()] as $user) {
            $role = $user->roles->first()->name;
            foreach (['/test', '/attempt', '/mock'] as $url) {
                $status = $this->actingAs($user)->get($url)->getStatusCode();
                $expected = ($role === 'Student' && $url === '/mock') ? 403 : 200;
                $this->assertSame($expected, $status, "$url as $role returned $status");
            }
        }
    }

    public function test_home_page_renders_for_guest(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_attempt_index_works_on_sqlite_with_ai_score_avg(): void
    {
        $this->actingAs($this->admin())->get('/attempt')->assertOk();
    }
}
