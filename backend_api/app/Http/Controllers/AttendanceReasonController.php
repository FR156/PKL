<?php

namespace App\Http\Controllers;

use App\Models\AttendanceReason;
use App\Http\Controllers\AttendanceController;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceReasonController extends Controller
{
    // GET /api/attendance-reasons/review/{id}
    public function show($id)
    {
        $reason = AttendanceReason::findOrFail($id);

        return response()->json([
            'message' => 'Reason fetched successfully',
            'data' => $reason
        ]);
    }
    
    // POST /api/attendance-reasons
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'reason_type' => 'required|in:late,auto_clockout',
            'description' => 'required|string|max:500',
        ]);

        $reason = AttendanceReason::create($validated);

        return response()->json([
            'message' => 'Reason submitted successfully',
            'data' => $reason
        ]);
    }

    // PUT /api/attendance-reasons/auto-clockout
    public function addAutoClockOutReason(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:255',
        ]);

        // ambil user dari Sanctum
        $user = $request->user();

        // cari attendance hari ini milik user
        $attendance = Attendance::where('account_id', $user->id)
            ->orderByDesc('created_at')
            ->firstOrFail();

        // cari reason yang tipe auto_clock_out
        $reason = AttendanceReason::where('attendance_id', $attendance->id)
            ->where('reason_type', 'auto_clockout')
            ->firstOrFail();

        $reason->update([
            'description' => $request->description,
        ]);

        return response()->json(['message' => 'Reason updated successfully']);
    }


    public function pending()
    {
        $reasons = AttendanceReason::where('review_status', 'pending')->get();

        return response()->json([
            'message' => 'Pending attendance reasons fetched successfully',
            'data' => $reasons
        ]);
    }

    // PUT /api/attendance-reasons/{id}/review
    public function review(Request $request, $id)
    {
        $validated = $request->validate([
            'review_status' => 'required|in:approved,rejected',
        ]);

        $reason = AttendanceReason::findOrFail($id);
        $reason->update([
            'review_status' => $validated['review_status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reason reviewed successfully (dummy)',
            'data' => $reason
        ]);
    }
}
