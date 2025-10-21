<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Field extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        // 'label',
        // 'data_type',
    ];

    /**
     * Relasi ke Entities melalui Attributes
     */
    public function entities()
    {
        return $this->belongsToMany(Entity::class, 'attributes')
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
