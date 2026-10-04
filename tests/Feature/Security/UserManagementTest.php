<?php

namespace Tests\Feature\Security;

use App\Models\User\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesRoleUsers;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use CreatesRoleUsers, RefreshDatabase;

    public function test_student_cannot_escalate_own_role(): void
    {
        $student = $this->student();

        $this->actingAs($student)
            ->put(route('user.update', $student), ['name' => 'X', 'role' => 'Admin'])
            ->assertForbidden();

        $this->assertTrue($student->fresh()->hasRole('Student'));
        $this->assertFalse($student->fresh()->hasRole('Admin'));
    }

    public function test_teacher_cannot_modify_or_delete_other_users(): void
    {
        $teacher = $this->teacher();
        $victim = $this->student();

        $this->actingAs($teacher)->put(route('user.update', $victim), ['name' => 'Hacked'])->assertForbidden();
        $this->actingAs($teacher)->delete(route('user.destroy', $victim))->assertForbidden();
        $this->actingAs($teacher)->get(route('user.index'))->assertForbidden();

        $this->assertNotSame('Hacked', $victim->fresh()->name);
        $this->assertNotNull(User::find($victim->id));
    }

    public function test_admin_can_change_roles_but_not_own_or_delete_self(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $this->actingAs($admin)
            ->put(route('user.update', $student), ['name' => 'Teach', 'role' => 'Teacher'])
            ->assertRedirect();
        $this->assertTrue($student->fresh()->hasRole('Teacher'));

        $this->actingAs($admin)->delete(route('user.destroy', $admin))->assertForbidden();

        $this->actingAs($admin)
            ->put(route('user.update', $admin), ['name' => 'A', 'role' => 'Student'])
            ->assertSessionHasErrors();
        $this->assertTrue($admin->fresh()->hasRole('Admin'));
    }

    public function test_unknown_role_is_rejected(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $this->actingAs($admin)
            ->put(route('user.update', $student), ['name' => 'A', 'role' => 'Superuser'])
            ->assertSessionHasErrors('role');
    }
}
