<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendancePhotoController extends Controller
{
    public function show($id)
    {
        $attendance = Attendance::findOrFail($id);
        
        // Check if photo exists
        if (!$attendance->photo_path) {
            abort(404, 'Photo not found');
        }
        
        // Check if file exists in storage
        if (!Storage::disk('public')->exists($attendance->photo_path)) {
            abort(404, 'Photo file not found');
        }
        
        // Get file contents and appropriate MIME type
        $file = Storage::disk('public')->get($attendance->photo_path);
        $mimeType = Storage::disk('public')->mimeType($attendance->photo_path);
        
        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline; filename="' . basename($attendance->photo_path) . '"');
    }
    
    // Alternative method using StreamedResponse (better for large files)
    public function stream($attendanceId)
    {
        $attendance = Attendance::findOrFail($attendanceId);
        
        if (!$attendance->photo_path) {
            abort(404, 'Photo not found');
        }
        
        if (!Storage::disk('public')->exists($attendance->photo_path)) {
            abort(404, 'Photo file not found');
        }
        
        return Storage::disk('public')->response($attendance->photo_path);
    }
}