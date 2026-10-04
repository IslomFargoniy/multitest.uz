<?php

namespace Tests\Feature\Commands;

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

class CompressExistingAudioCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (trim((string) @shell_exec('command -v ffmpeg')) === '') {
            $this->markTestSkipped('ffmpeg is not installed.');
        }
    }

    public function test_command_compresses_all_existing_uncompressed_audio_files()
    {
        Queue::fake([EvaluateSpeakingJob::class]);
        Storage::fake('public');

        // Setup models
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

        // Create 2 fake uncompressed files
        Storage::disk('public')->makeDirectory('attempt_answers_audio');

        $path1 = 'attempt_answers_audio/test1.webm';
        $physicalPath1 = Storage::disk('public')->path($path1);
        exec('ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 1 '.escapeshellarg($physicalPath1));

        $path2 = 'attempt_answers_audio/test2.webm';
        $physicalPath2 = Storage::disk('public')->path($path2);
        exec('ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 1 '.escapeshellarg($physicalPath2));

        // Create 2 answers (one uncompressed, one already compressed)
        $answer1 = new AttemptAnswer;
        $answer1->attempt_part_id = $attemptPart->id;
        $answer1->question_id = $question->id;
        $answer1->started_at = now();
        $answer1->audio_path = '/storage/'.$path1;
        $answer1->saveQuietly();

        // Create another question to avoid unique constraint
        $question2 = Question::factory()->create([
            'part_id' => $part->id,
            'textarea' => 'Sample Question Text 2',
        ]);
        $answer2 = new AttemptAnswer;
        $answer2->attempt_part_id = $attemptPart->id;
        $answer2->question_id = $question2->id;
        $answer2->started_at = now();
        $answer2->audio_path = '/storage/'.$path2;
        $answer2->saveQuietly();

        // Run the artisan command
        $this->artisan('audio:compress-existing')
            ->expectsOutputToContain('Found 2 uncompressed audio files. Starting compression...')
            ->expectsOutputToContain('Compression completed.')
            ->assertSuccessful();

        $answer1->refresh();
        $answer2->refresh();

        // Both should now be compressed to MP3
        $this->assertStringEndsWith('.mp3', $answer1->audio_path);
        $this->assertStringEndsWith('.mp3', $answer2->audio_path);

        Storage::disk('public')->assertExists(str_replace('/storage/', '', $answer1->audio_path));
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $answer2->audio_path));

        Queue::assertNotPushed(EvaluateSpeakingJob::class);
    }
}
