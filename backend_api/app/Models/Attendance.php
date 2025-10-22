<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{

    use HasFactory;

    protected $fillable = [
        'account_id',
        'type',
        'timestamp',
        'latitude',
        'longitude',
        'photo_path',
        'is_late',
        'status',
        'auto_clockout',
        'reviewed_by',
        'reviewed_at',
        'reason',
    ];

    public function reason()
    {
        return $this->hasOne(AttendanceReason::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}

?>