<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{

    use HasFactory;

    protected $fillable = [
        'account_id',
        'photo_path',
        'location',
        'clock_in',
        'clock_out',
        'is_late',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    public function reason()
    {
        return $this->hasOne(AttendanceReason::class);
    }
}

?>