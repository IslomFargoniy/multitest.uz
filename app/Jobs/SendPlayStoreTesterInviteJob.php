<?php

namespace App\Jobs;

use App\Mail\PlayStoreTesterInviteMail;
use App\Models\User\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPlayStoreTesterInviteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public User $user;
    public string $testingUrl;
    public ?string $customSubject;
    public ?string $customMessage;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        User $user,
        string $testingUrl = 'https://play.google.com/apps/testing/uz.multitest.app',
        ?string $customSubject = null,
        ?string $customMessage = null
    ) {
        $this->user = $user;
        $this->testingUrl = $testingUrl;
        $this->customSubject = $customSubject;
        $this->customMessage = $customMessage;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (empty($this->user->email)) {
            Log::info("SendPlayStoreTesterInviteJob skipped: user {$this->user->id} has no email.");
            return;
        }

        try {
            Mail::to($this->user->email)->send(
                new PlayStoreTesterInviteMail(
                    $this->user,
                    $this->testingUrl,
                    $this->customSubject,
                    $this->customMessage
                )
            );

            $this->user->update([
                'tester_invited_at' => now(),
                'tester_invite_count' => ($this->user->tester_invite_count ?? 0) + 1,
            ]);

            Log::info("PlayStore tester invite successfully sent to {$this->user->email} (User ID: {$this->user->id})");
        } catch (\Throwable $e) {
            Log::error("SendPlayStoreTesterInviteJob failed for {$this->user->email}: " . $e->getMessage());
            throw $e;
        }
    }
}
