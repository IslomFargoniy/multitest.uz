<?php

namespace App\Http\Requests;

use App\Models\User\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'digits_between:9,12', Rule::unique('users', 'phone')->ignore($this->route('user')->id)],

            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')->id)
            ],
            'password' => ['nullable', \Illuminate\Validation\Rules\Password::defaults()],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')],
            'create_test_limit' => ['nullable', 'integer', 'min:0'],
        ];
    }

}
