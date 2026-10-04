<?php

namespace App\Models;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'comment',
        'description',
        'finished_at',
        'started_at',
        'starts_at',
        'test_id',
        'user_id',
        'audio_path',
        'slug',
        'active',
        'open',
    ];

    protected $with = [
        'test',
    ];

    protected $appends = [
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'starts_at' => 'datetime',
        'active' => 'boolean',
    ];

    public function getStatusAttribute(): string
    {
        if (!$this->active) {
            return 'inactive';
        }
        $now = now();
        $start = $this->started_at ?? $this->starts_at;
        if ($start && $now->lt(\Carbon\Carbon::parse($start))) {
            return 'scheduled';
        }
        if ($this->finished_at && $now->gt(\Carbon\Carbon::parse($this->finished_at))) {
            return 'expired';
        }
        return 'active';
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function attempts()
    {
        return $this->hasMany(Attempt::class, 'mock_id');
    }

    public function students()
    {
        return $this->hasMany(MockStudent::class, 'mock_id');
    }

    public function mock_tests()
    {
        return $this->hasMany(MockTest::class, 'mock_id');
    }
}
