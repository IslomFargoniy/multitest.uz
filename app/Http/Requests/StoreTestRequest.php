<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth()->id(),
        ]);

        if (! $this->filled('description')) {
            $this->merge([
                'description' => 'This speaking test is powered by multitest.uz. All audio recordings are the exclusive property of this platform and are designed specifically for our users. Please follow the instructions carefully.',
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'language_id' => ['required', 'exists:languages,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'audio_path' => \App\Support\AudioUpload::rules(\App\Support\AudioUpload::MAX_PROMPT_KB),
        ];
    }
}
