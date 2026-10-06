<?php

namespace App\Mail;

use App\Models\User\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlayStoreTesterInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $testingUrl;
    public ?string $customSubject;
    public ?string $customMessage;

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

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->customSubject ?: "🚀 MultiTest ilovasi Google Play'da — Rasmiy sinovchi bo'ling!",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.play_store_invite',
            with: [
                'user' => $this->user,
                'testingUrl' => $this->testingUrl,
                'subject' => $this->customSubject,
                'customMessage' => $this->customMessage,
            ],
        );
    }
}
