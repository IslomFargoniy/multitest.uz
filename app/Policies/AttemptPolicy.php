<?php

namespace App\Policies;

use App\Models\Attempt;
use App\Models\User\User;

/**
 * Admin passes via Gate::before(). Teachers manage attempts of their own mocks/tests,
 * students only see (and may delete) their own attempts and can never evaluate.
 */
class AttemptPolicy
{
    private function isOwner(User $user, Attempt $attempt): bool
    {
        return $attempt->user_id !== null && $user->id === $attempt->user_id;
    }

    private function teacherManages(User $user, Attempt $attempt): bool
    {
        if (!$user->hasRole('Teacher')) {
            return false;
        }

        $attempt->loadMissing(['mock:id,user_id', 'test:id,user_id']);

        return $attempt->mock?->user_id === $user->id || $attempt->test?->user_id === $user->id;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Attempt $attempt): bool
    {
        return $this->isOwner($user, $attempt) || $this->teacherManages($user, $attempt);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function evaluate(User $user, Attempt $attempt): bool
    {
        return $this->teacherManages($user, $attempt);
    }

    public function update(User $user, Attempt $attempt): bool
    {
        return $this->teacherManages($user, $attempt);
    }

    public function delete(User $user, Attempt $attempt): bool
    {
        return $this->isOwner($user, $attempt);
    }

    public function restore(User $user, Attempt $attempt): bool
    {
        return false;
    }

    public function forceDelete(User $user, Attempt $attempt): bool
    {
        return false;
    }
}
