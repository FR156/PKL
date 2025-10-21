<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes'; // pivot table entity <-> field

    protected $fillable = [
        'entity_id',
        'field_id',
        // 'is_required',
        // 'display_order',
    ];

    public $timestamps = false;

    /**
     * Entity yang memiliki attribute ini
     */
    public function entity()
    {
        return $this->belongsTo(Entity::class);
    }

    /**
     * Field yang termasuk dalam attribute ini
     */
    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    /**
     * Permissions yang terkait ke attribute ini
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_has_attributes')
                    ->withPivot('access_type')
                    ->withTimestamps();
    }
}
