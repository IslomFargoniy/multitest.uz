<?php

namespace App\Http\Requests;

use App\Models\Mock;
use App\Models\Test;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'started_at' => now()->toDateTimeString(),
            'user_id' => $this->user()?->id,
        ]);

        if (!$this->filled('test_id') && $this->filled('mock_id')) {
            $mock = Mock::query()->find($this->input('mock_id'));
            $testId = $mock?->test_id
                ?? $mock?->mock_tests()->inRandomOrder()->value('test_id');

            if ($testId) {
                $this->merge(['test_id' => $testId]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'mock_id' => ['nullable', 'exists:mocks,id'],
            'test_id' => ['required', 'exists:tests,id'],
            'started_at' => ['required', 'date'],
            'part_ids' => ['nullable', 'array'],
            'part_ids.*' => [Rule::exists('parts', 'id')->where('test_id', $this->input('test_id'))],
        ];
    }

    public function messages(): array
    {
        return [
            'test_id.required' => 'No test found for this Mock.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = $this->user();
                $testId = (int) $this->input('test_id');
                $mock = $this->filled('mock_id') ? Mock::query()->find($this->input('mock_id')) : null;

                if ($mock) {
                    $privileged = $user->hasRole('Admin') || $mock->user_id === $user->id;

                    if (!$privileged && $mock->status !== 'active') {
                        $validator->errors()->add('mock_id', 'This mock is not available.');

                        return;
                    }

                    $belongs = $mock->test_id === $testId || $mock->mock_tests()->where('test_id', $testId)->exists();
                    if (!$belongs) {
                        $validator->errors()->add('test_id', 'The test does not belong to this mock.');
                    }

                    return;
                }

                if (!Test::query()->visibleTo($user)->whereKey($testId)->exists()) {
                    $validator->errors()->add('test_id', 'The selected test is not available.');
                }
            },
        ];
    }
}
