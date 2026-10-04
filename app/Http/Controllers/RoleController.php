<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function allJson(Request $request)
    {
        try {

            $tests = Role::query();

            $tests = $tests->get();

            return response()->json([
                'status' => 'success',
                'data' => $tests,
            ]);
        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => __('error.generic'),
            ], 500);
        }
    }
}
