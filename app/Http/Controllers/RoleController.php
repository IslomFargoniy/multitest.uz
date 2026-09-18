<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
                'data' => $tests
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage()
            ], 500);
        }
    }

}
