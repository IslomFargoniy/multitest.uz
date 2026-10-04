<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Models\Question;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Services\FileUploadService;

class QuestionController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $e) {

            throw $e;

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
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

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
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

            if ($question->audio_path) {
                $this->fileUploadService->deleteFile($question->audio_path);
            }

            return redirect()->back()->with('success', 'Question deleted successfully.');

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }
}
