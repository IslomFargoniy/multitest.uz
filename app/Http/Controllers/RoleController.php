<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function allJson(Request $request)
    {
        try {
            $roles = Cache::remember('roles_all_json', 86400, function () {
                return Role::all();
            });

            return response()->json([
                'status' => 'success',
                'data' => $roles
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage()
            ], 500);
        }
    }
}
