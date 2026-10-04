<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartRequest;
use App\Http\Requests\UpdatePartRequest;
use App\Models\Part;
use App\Models\Test;
use App\Services\FileUploadService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class PartController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartRequest $request)
    {
        try {
            $data = $request->validated();
            $this->authorize('update', Test::findOrFail($data['test_id']));

            if ($request->hasFile('audio_path')) {
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'parts/audio');
            } else {
                $data['audio_path'] = null;
            }

            Part::create($data);

            return redirect()->back()->with('success', 'Part created successfully');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePartRequest $request, Part $part)
    {
        try {
            $this->authorize('update', $part);
            $data = $request->validated();
            $oldFilePath = null;
            if ($request->hasFile('audio_path')) {
                $oldFilePath = $part->audio_path;
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'parts/audio');
            } else {
                $data['audio_path'] = $part->audio_path;
            }

            $part->update($data);

            if ($oldFilePath) {
                $this->fileUploadService->deleteFile($oldFilePath);
            }

            return redirect()->back()->with('success', 'Part updated successfully.');

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
    public function destroy(Part $part)
    {
        try {
            $this->authorize('delete', $part);
            $part->delete();

            return redirect()->back()->with('success', 'Part deleted successfully.');

        } catch (AuthorizationException|ModelNotFoundException|ValidationException $exception) {

            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            throw ValidationException::withMessages(['error' => [__('error.generic')]]);
        }
    }
}
