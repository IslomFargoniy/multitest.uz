<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Part;
use App\Models\Question;
use App\Services\FileUploadService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        try {
            $data = $request->validated();
            $this->authorize('update', Part::findOrFail($data['part_id']));

            if ($request->hasFile('audio_path')) {
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'questions/audio');
            } else {
                $data['audio_path'] = null;
            }

            Question::create($data);

            return redirect()->back()->with('success', 'Question created successfully');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $e) {

            throw $e;
        } catch (\Exception $e) {
            report($e);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        try {
            $this->authorize('update', $question);
            $data = $request->validated();
            $oldFilePath = null;
            if ($request->hasFile('audio_path')) {
                $oldFilePath = $question->audio_path;
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'questions/audio');
            } else {
                $data['audio_path'] = $question->audio_path;
            }

            $question->update($data);

            if ($oldFilePath) {
                $this->fileUploadService->deleteFile($oldFilePath);
            }

            return redirect()->back()->with('success', 'Question updated successfully.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        try {
            $this->authorize('delete', $question);
            $question->delete();

            return redirect()->back()->with('success', 'Question deleted successfully.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }
}
