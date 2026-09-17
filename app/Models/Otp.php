<?php

namespace App\Models;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'expired_at',
        'expired',
        'is_android',
        'is_ios',
        'is_mobile',
        'is_email',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'expired' => 'boolean',
        'is_android' => 'boolean',
        'is_ios' => 'boolean',
        'is_mobile' => 'boolean',
        'is_email' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
