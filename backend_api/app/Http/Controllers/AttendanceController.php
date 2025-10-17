<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use App\Models\AttendanceReason;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    // GET /api/attendances
    public function index()
    {
        $attendances = Attendance::get();
        return response()->json($attendances);
    }

    // Show single attendance record
    public function show($id)
    {
        $attendance = Attendance::findOrFail($id);

        return response()->json($attendance);
    }

    // Clock In function
    public function clockIn(Request $request)
    {
        $validated = $request->validate([
            'timestamp' => 'required|date',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'photo_path' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $timestamp = Carbon::parse($validated['timestamp']);
        // FIX: Compare only the time portion, not the full datetime
        $checkInTime = $timestamp->format('H:i:s');
        $workStartTime = '08:00:00';
        $isLate = $checkInTime > $workStartTime;

        // Debugging - add this temporarily to see what's happening
        // \Log::info('Clock In Debug', [
        //     'timestamp' => $validated['timestamp'],
        //     'parsed_timestamp' => $timestamp->toString(),
        //     'check_in_time' => $checkInTime,
        //     'work_start_time' => $workStartTime,
        //     'is_late' => $isLate
        // ]);

        $attendance = Attendance::create([
            'account_id' => Auth::id(),
            'type' => 'clock_in',
            'timestamp' => $validated['timestamp'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo_path' => $validated['photo_path'],
            'is_late' => $isLate,
            'status' => 'approved',
        ]);

        if ($isLate) {
            if (empty($validated['description'])) {
                return response()->json([
                    'message' => 'You are late. Please provide a description for lateness.'
                ], 422);
            }

            AttendanceReason::create([
                'attendance_id' => $attendance->id,
                'reason_type' => 'late',
                'description' => $validated['description'],
                'review_status' => 'pending',
            ]);
        }

        return success('Clock in recorded successfully', $attendance);
    }

    // Clock Out
    public function clockOut(Request $request)
    {
        $validated = $request->validate([
            'timestamp' => 'required|date',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'photo_path' => 'required|string|max:255',
            'auto_clockout' => 'boolean',
        ]);

        $attendance = Attendance::create([
            'account_id' => Auth::id(),
            'type' => 'clock_out',
            'timestamp' => $validated['timestamp'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo_path' => $validated['photo_path'],
            'status' => 'approved',
            'auto_clockout' => $validated['auto_clockout'] ?? false,
        ]);

        // Kalau auto_clockout true → simpan reason otomatis
        if (!empty($validated['auto_clockout']) && $validated['auto_clockout'] === true) {
            AttendanceReason::create([
                'attendance_id' => $attendance->id,
                'reason_type' => 'auto_clockout',
                'description' => 'Automatic clock-out triggered (no manual action).',
                'review_status' => 'pending',
            ]);
        }

        return success('Clock out recorded successfully', $attendance);
    }


    public function approved()
    {
        $records = Attendance::where('status', 'approved')->get();

        if (!$records) {
            return response()->json([
                'message' => 'No approved attendances found',
                'data' => []
            ], 404);
        }

        return success('Approved attendances retrieved successfully', $records);
    }

    // Review attendances (approve/reject)
    public function review(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string',
        ]);

        $attendance = Attendance::findOrFail($id);
        $attendance->update([
            'status' => $validated['status'],
            'reason' => $validated['reason'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return success('Attendance reviewed successfully', $attendance);
    }

    // DELETE /api/attendances/{id}
    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return success('Attendance deleted successfully');
    }
}
