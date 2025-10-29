<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

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
        'irregular_clockout',
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

    protected static function boot()
    {
        parent::boot();

        // Delete the file when attendance record is deleted
        static::deleting(function ($attendance) {
            if ($attendance->photo_path) {
                Storage::disk('public')->delete($attendance->photo_path);
            }
        });

        // Optional: Also delete file when record is updated and photo_path changes
        static::updating(function ($attendance) {
            $originalPhotoPath = $attendance->getOriginal('photo_path');
            $newPhotoPath = $attendance->photo_path;

            // If photo_path changed and original file exists, delete the old file
            if ($originalPhotoPath && $originalPhotoPath !== $newPhotoPath) {
                Storage::disk('public')->delete($originalPhotoPath);
            }
        });
    }
}

?>