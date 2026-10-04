<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Http\Requests\StorePartRequest;
use App\Http\Requests\UpdatePartRequest;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;

class PartController extends Controller
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
    public function store(StorePartRequest $request)
    {
        try {
            $data = $request->validated();
            $this->authorize('update', \App\Models\Test::findOrFail($data['test_id']));

            if ($request->hasFile('audio_path')) {
                $data['audio_path'] = $this->fileUploadService->uploadAudio($request->file('audio_path'), 'parts/audio');
            } else {
                $data['audio_path'] = null;
            }

            Part::create($data);
            return redirect()->back()->with('success', 'Part created successfully');

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Part $part)
    {
        //
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

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
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

            if ($part->audio_path) {
                $this->fileUploadService->deleteFile($part->audio_path);
            }

            return redirect()->back()->with('success', 'Part deleted successfully.');

        } catch (\Illuminate\Auth\Access\AuthorizationException | \Illuminate\Database\Eloquent\ModelNotFoundException | \Illuminate\Validation\ValidationException $exception) {

            throw $exception;

        } catch (\Exception $exception) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$exception->getMessage()],
            ]);
        }
    }
}
