<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * API documentation is for administrators only, and hidden in production unless L5_SWAGGER_ENABLED=true.
 */
class EnsureSwaggerAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(app()->isProduction() && ! config('multitest.swagger_enabled'), 404);

        $user = $request->user();
        abort_unless($user && $user->hasRole('Admin'), 403);

        return $next($request);
    }
}
