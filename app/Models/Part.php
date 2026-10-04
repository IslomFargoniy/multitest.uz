<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Part extends Model
{
    /** @use HasFactory<\Database\Factories\PartFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (self $model) {
            if ($model->isDirty('description')) {
                $model->description = $model->description === null ? null : \App\Support\HtmlSanitizer::clean($model->description);
            }
        });
    }

    protected $fillable = [
        'test_id',
        'name',
        'description',
        'audio_path',
    ];

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }

    public function attemptParts()
    {
        return $this->hasMany(AttemptPart::class, 'part_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'part_id');
    }
}
