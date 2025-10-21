<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    /**
     * Relasi ke Attributes (pivot entity + field)
     */
    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'permission_has_attributes')
                    ->withPivot('access_type')
                    ->withTimestamps();
    }
}
