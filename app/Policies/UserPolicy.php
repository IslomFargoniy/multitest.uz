<?php

namespace App\Policies;

use App\Models\User\User;

/**
 * User management is admin-only. Admins pass via Gate::before(); everyone else is denied here.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, User $target): bool
    {
        return false;
    }

    public function update(User $user, User $target): bool
    {
        return false;
    }

    public function delete(User $user, User $target): bool
    {
        // An admin must not delete their own account from the management screen.
        return $user->hasRole('Admin') && $user->id !== $target->id;
    }
}
