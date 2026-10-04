<?php

namespace App\Models;

use Database\Factories\LanguageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    /** @use HasFactory<LanguageFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name_uz',
        'name_ru',
        'name_en',
        'flag',
    ];

    public function tests()
    {
        return $this->hasMany(Test::class, 'language_id');
    }
}
