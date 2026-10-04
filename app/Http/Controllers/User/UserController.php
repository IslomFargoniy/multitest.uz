<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        $this->authorize('viewAny', User::class);

        $user = User::with([
            'roles',
        ])
            ->withCount(['attempts', 'tests', 'mocks'])
            ->whereNotIn('id', [Auth::user()->id])
            ->orderBy('id', 'desc');

        if ($request->search) {
            $user->where(function ($query) use ($request) {
                $query->whereLike('name', "%$request->search%")
                    ->orWhereLike('phone', "%$request->search%")
                    ->orWhereLike('email', "%$request->search%");
            });
        }

        if ($request->role) {
            $user->role($request->role);
        }

        $user = $user->paginate($per_page);

        $roles = \Spatie\Permission\Models\Role::all();

        return Inertia::render('user/index', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return Inertia::render('user/show', [
            'user' => $user->loadCount(['attempts', 'tests', 'mocks'])->load(['last_attempt.test']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {

            $validated = $request->validated();

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']); // Don't update if password is empty
            }

            if ($request->filled('role') && $user->id === Auth::id() && !$user->hasRole($request->role)) {
                throw ValidationException::withMessages(['role' => ['You cannot change your own role.']]);
            }

            unset($validated['role']);
            $user->update($validated);

            if ($request->filled('role')) {
                $user->syncRoles($request->role);
            }

            return back()->with('success', 'User updated successfully.');
        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        abort_if($user->id === Auth::id(), 403, 'You cannot delete your own account here.');

        try {

            $user->delete();
            return back()->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
