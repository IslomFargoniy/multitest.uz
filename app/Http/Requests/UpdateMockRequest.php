<?php

namespace App\Http\Requests;

use App\Models\Test;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'test_id' => 'required|exists:tests,id',
            'comment' => 'nullable|string',
            'started_at' => 'required|date',
            'finished_at' => 'required|date|after:started_at',
            'active' => 'nullable|boolean',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->has('test_id') || ! $this->filled('test_id')) {
                    return;
                }

                if (! Test::query()->visibleTo($this->user())->whereKey($this->input('test_id'))->exists()) {
                    $validator->errors()->add('test_id', 'The selected test is not available.');
                }
            },
        ];
    }
}
