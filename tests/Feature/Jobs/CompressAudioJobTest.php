<?php

namespace Tests\Feature\Jobs;

use App\Jobs\CompressAudioJob;
use App\Jobs\EvaluateSpeakingJob;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptPart;
use App\Models\Language;
use App\Models\Part;
use App\Models\Question;
use App\Models\Test as ModelTest;
use App\Models\User\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompressAudioJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (trim((string) @shell_exec('command -v ffmpeg')) === '') {
            $this->markTestSkipped('ffmpeg is not installed.');
        }
    }

    public function test_compress_audio_job_successfully_compresses_audio_and_updates_model()
    {
        Queue::fake([EvaluateSpeakingJob::class]);
        Storage::fake('public');

        // Setup dependent models
        $user = User::factory()->create();
        $language = Language::factory()->create();
        $test = ModelTest::factory()->create([
            'language_id' => $language->id,
            'user_id' => $user->id,
            'name' => 'Sample Test',
        ]);
        $attempt = Attempt::factory()->create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'name' => 'Sample Attempt',
            'started_at' => now(),
        ]);
        $part = Part::factory()->create([
            'test_id' => $test->id,
            'name' => 'Sample Part',
        ]);
        $attemptPart = AttemptPart::factory()->create([
            'attempt_id' => $attempt->id,
            'part_id' => $part->id,
            'started_at' => now(),
        ]);
        $question = Question::factory()->create([
            'part_id' => $part->id,
            'textarea' => 'Sample Question Text',
        ]);

        // Ensure directory exists
        Storage::disk('public')->makeDirectory('attempt_answers_audio');
        $path = 'attempt_answers_audio/test-audio.webm';
        $physicalTempPath = Storage::disk('public')->path($path);

        // Generate a valid 1-second silent WebM audio file using FFmpeg
        $generateCommand = 'ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 1 '.escapeshellarg($physicalTempPath).' 2>&1';
        exec($generateCommand);

        $audioUrl = '/storage/'.$path;

        // Create the answer record (saved triggers observer)
        // We temporarily disable queue or save to avoid automatic dispatch in observer
        // so we can test the job execution explicitly.
        $answer = new AttemptAnswer;
        $answer->attempt_part_id = $attemptPart->id;
        $answer->question_id = $question->id;
        $answer->started_at = now();
        $answer->audio_path = $audioUrl;

        // Save quietly so observer doesn't trigger the job automatically during setup
        $answer->saveQuietly();

        // Run the job handler synchronously
        $job = new CompressAudioJob($answer->id);
        $job->handle();

        $answer->refresh();

        // Check if the file was compressed to mp3
        $this->assertStringEndsWith('.mp3', $answer->audio_path);

        $cleanPath = str_replace('/storage/', '', $answer->audio_path);
        Storage::disk('public')->assertExists($cleanPath);
        Storage::disk('public')->assertMissing('attempt_answers_audio/test-audio.webm');

        Queue::assertPushed(EvaluateSpeakingJob::class);
    }
}
