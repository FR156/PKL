<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceReason extends Model
{
    protected $fillable = [
        'attendance_id', 
        'reason_type', 
        'description',
        'review_status', 
        'reviewed_by', 
        'reviewed_at'
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}

?>