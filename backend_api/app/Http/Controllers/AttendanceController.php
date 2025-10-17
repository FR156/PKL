<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

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

    // Clock In
    public function clockIn(Request $request)
    {
        $validated = $request->validate([
            'timestamp' => 'required|date',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'photo_path' => 'required|string|max:255',
        ]);

        $attendance = Attendance::create([
            'account_id' => $request->user()->id,
            'type' => 'clock_in',
            'timestamp' => $validated['timestamp'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo_path' => $validated['photo_path'],
            'status' => 'approved',
            'is_late' => false, // nanti bisa diatur logic auto-late check
        ]);

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
        ]);

        $attendance = Attendance::create([
            'account_id' => $request->user()->id,
            'type' => 'clock_out',
            'timestamp' => $validated['timestamp'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo_path' => $validated['photo_path'],
            'status' => 'approved',
            'auto_clockout' => false, // nanti logic auto akan ubah ini jadi true
        ]);

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
