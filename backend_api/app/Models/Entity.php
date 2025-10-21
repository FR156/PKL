<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Relasi ke Fields melalui Attributes
     */
    public function fields()
    {
        return $this->belongsToMany(Field::class, 'attributes')
                    ->withTimestamps();
    }

    /**
     * Relasi langsung ke Attributes (pivot)
     */
    public function attributes()
    {
        return $this->hasMany(Attribute::class);
    }
}
