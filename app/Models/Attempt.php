<?php

namespace App\Models;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attempt extends Model
{
    /** @use HasFactory<\Database\Factories\AttemptFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($attempt) {
            $attempt->verify_code ??= \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(32));
        });

        static::deleting(function ($attempt) {
            $attempt->attempt_parts()->each(function ($part) {
                $part->delete();
            });
        });
    }

    protected $fillable = [
        'name',
        'user_id',
        'mock_id',
        'mock_student_id',
        'test_id',
        'started_at',
        'finished_at',
        'evaluated_at',
        'score',
        'tab_switch_count',
        'review',
    ];

    protected $hidden = ['verify_code'];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'score' => 'integer',
        'tab_switch_count' => 'integer',
        'evaluated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function mockStudent()
    {
        return $this->belongsTo(MockStudent::class, 'mock_student_id');
    }

    public function scopeWithAiScoreAvg($query)
    {
        return $query->withAvg('attempt_answers as ai_score_avg', 'score_ai');
    }

    public function mock()
    {
        return $this->belongsTo(Mock::class, 'mock_id');
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }

    public function attempt_parts()
    {
        return $this->hasMany(AttemptPart::class, 'attempt_id');
    }

    /**
     * Final score on the 0-75 scale: teacher score if set, otherwise the rounded AI average (when loaded).
     */
    public function getFinalScoreAttribute(): ?float
    {
        if ($this->score !== null) {
            return (float) $this->score;
        }

        $avg = $this->attributes['ai_score_avg'] ?? null;

        return $avg !== null ? round((float) $avg, 1) : null;
    }

    public function getCefrLevelAttribute(): ?string
    {
        $score = $this->final_score;

        return match (true) {
            $score === null => null,
            $score >= 65 => 'C1',
            $score >= 51 => 'B2',
            $score >= 38 => 'B1',
            default => 'Below B1',
        };
    }

    public function attempt_answers()
    {
        return $this->hasManyThrough(AttemptAnswer::class, AttemptPart::class, 'attempt_id', 'attempt_part_id');
    }
}
