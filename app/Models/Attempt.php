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

    public function attempt_answers()
    {
        return $this->hasManyThrough(AttemptAnswer::class, AttemptPart::class, 'attempt_id', 'attempt_part_id');
    }
}
