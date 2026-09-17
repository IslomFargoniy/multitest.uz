<?php

namespace App\Models\User;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Attempt;
use App\Models\Mock;
use App\Models\Test;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected static function newFactory()
    {
        return \Database\Factories\UserFactory::new();
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'phone',
        'email',
        'email_verified_at',
        'password',
        'avatar',
        'google_id',
        'telegram_id',
        'ref_telegram_id',
        'create_test_limit',
    ];

    protected $with = [
        'roles'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function mocks()
    {
        return $this->hasMany(Mock::class, 'user_id');
    }

    public function tests()
    {
        return $this->hasMany(Test::class, 'user_id');
    }

    public function attempts()
    {
        return $this->hasMany(Attempt::class, 'user_id');
    }

    public function last_attempt()
    {
        return $this->hasOne(Attempt::class, 'user_id')->latestOfMany();
    }

}
