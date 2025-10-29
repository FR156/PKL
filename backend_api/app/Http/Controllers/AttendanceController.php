<?php

namespace App\Http\Controllers;

use App\Http\Requests\Attendance\ClockInRequest;
use App\Http\Requests\Attendance\ClockOutRequest;
use App\Http\Requests\Attendance\ReviewAttendanceRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    // GET /api/attendances
    public function index()
    {
        $attendances = $this->attendanceService->getAllAttendances();
        return response()->json($attendances);
    }

    // Show single attendance record
    public function show($id)
    {
        $attendance = $this->attendanceService->getAttendanceById($id);
        return response()->json($attendance);
    }

    // Clock In controller
    public function clockIn(ClockInRequest $request)
    {
        try {
            $attendance = $this->attendanceService->clockIn(
                $request->validated(), 
                $request->user()->id
            );
            return success('Clock in recorded successfully', $attendance);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Something went wrong while recording attendance.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Clock Out controller
    public function clockOut(ClockOutRequest $request)
    {
        try {
            $attendance = $this->attendanceService->clockOut(
                $request->validated(), 
                $request->user()->id
            );
            return success('Clock out recorded successfully', $attendance);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Something went wrong while recording attendance.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function showPhoto($id)
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

    public function approved()
    {
        $records = $this->attendanceService->getApprovedAttendances();

        if ($records->isEmpty()) {
            return response()->json([
                'message' => 'No approved attendances found',
                'data' => []
            ], 404);
        }

        return success('Approved attendances retrieved successfully', $records);
    }

    // Review attendances (approve/reject)
    public function review(ReviewAttendanceRequest $request, $id)
    {
        $attendance = $this->attendanceService->reviewAttendance(
            $id, 
            $request->validated(), 
            $request->user()->id
        );

        return success('Attendance reviewed successfully', $attendance);
    }

    // DELETE /api/attendances/{id}
    public function destroy($id)
    {
        $this->attendanceService->deleteAttendance($id);
        return success('Attendance deleted successfully');
    }
}