<?php

namespace App\Models;

use Database\Factories\AttemptAnswerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttemptAnswer extends Model
{
    /** @use HasFactory<AttemptAnswerFactory> */
    use HasFactory;

    protected $fillable = [
        'attempt_part_id',
        'question_id',
        'started_at',
        'finished_at',
        'audio_path',
        'audio_second',
        'transcript',
        'review_ai',
        'review',
        'score_ai',
        'score',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'audio_second' => 'float',
        'score_ai' => 'integer',
        'score' => 'integer',
    ];

    public function attempt_part()
    {
        return $this->belongsTo(AttemptPart::class, 'attempt_part_id');
    }

    public function attempt()
    {
        return $this->hasOneThrough(Attempt::class, AttemptPart::class, 'id', 'id', 'attempt_part_id', 'attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
