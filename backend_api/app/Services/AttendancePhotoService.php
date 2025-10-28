<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Attendance;

class AttendancePhotoService
{
    public function upload(UploadedFile $file): string
    {
        $filename = 'attendance_' . time() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('attendance_photos', $filename);

        return $path;
    }
}
