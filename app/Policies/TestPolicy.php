<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User\User;

class TestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Test $test): bool
    {
        return $test->is_public || $user->id === $test->user_id;
    }

    public function create(User $user): bool
    {
        // The per-user create_test_limit (set by an admin) is enforced in TestController::store.
        return $user->hasRole('Teacher') || (int) $user->create_test_limit > 0;
    }

    public function update(User $user, Test $test): bool
    {
        return $user->id === $test->user_id;
    }

    public function delete(User $user, Test $test): bool
    {
        return $user->id === $test->user_id;
    }

    public function restore(User $user, Test $test): bool
    {
        return $user->id === $test->user_id;
    }

    public function forceDelete(User $user, Test $test): bool
    {
        return $user->id === $test->user_id;
    }
}
