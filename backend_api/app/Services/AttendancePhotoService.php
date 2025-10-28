<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttendancePhotoService
{
    public function upload(UploadedFile $file): string
    {
        \Log::info('Upload started', [
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'is_valid' => $file->isValid()
        ]);

        // Check storage paths
        $storagePath = storage_path('app/public/attendance_photos');
        \Log::info('Storage path', ['path' => $storagePath]);
        \Log::info('Storage path exists', ['exists' => file_exists($storagePath)]);
        \Log::info('Storage path writable', ['writable' => is_writable($storagePath)]);
        
        // Validate file
        if (!$file->isValid()) {
            throw new \Exception('File upload failed');
        }

        // Generate unique filename
        $filename = 'attendance_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        // Store file with explicit disk configuration
        $path = $file->storeAs('attendance_photos', $filename, 'public');

        // Verify file was stored
        if (!Storage::disk('public')->exists($path)) {
            throw new \Exception('File storage failed');
        }

        // Verify storage
        $fullPath = storage_path('app/public/' . $path);
        \Log::info('Full storage path', ['full_path' => $fullPath]);
        \Log::info('File exists in storage', ['exists' => file_exists($fullPath)]);

        return $path;
    }

    // Add method to get full URL if needed
    public function getUrl($path)
    {
        return Storage::disk('public')->url($path);
    }
}