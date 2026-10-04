<?php

namespace App\Models;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Test extends Model
{
    /** @use HasFactory<\Database\Factories\TestFactory> */
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
        'user_id',
        'language_id',
        'name',
        'description',
        'audio_path',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Tests a user may read/use: admin = all, otherwise public ones plus their own. Guest = public only.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        if ($user && $user->hasRole('Admin')) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->where('is_public', true);
            if ($user) {
                $q->orWhere('user_id', $user->id);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    public function mock_tests()
    {
        return $this->hasMany(MockTest::class, 'test_id');
    }

    public function attempts()
    {
        return $this->hasMany(Attempt::class, 'test_id');
    }

    public function parts()
    {
        return $this->hasMany(Part::class, 'test_id');
    }
}
