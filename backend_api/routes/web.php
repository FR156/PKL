<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/attendance-photos/{filename}', function ($filename) {
    $path = 'attendance_photos/' . $filename;
    
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    
    return Storage::disk('public')->response($path);
})->name('attendance.photo');

Route::get('/attendance/{attendance}/photo', [AttendancePhotoController::class, 'show'])
    ->name('attendance.photo.show');