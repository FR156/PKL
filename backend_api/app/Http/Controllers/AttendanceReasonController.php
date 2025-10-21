<?php

namespace App\Http\Controllers;

use App\Models\AttendanceReason;
use Illuminate\Http\Request;

class AttendanceReasonController extends Controller
{
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
            'message' => 'Reason submitted successfully (dummy)',
            'data' => $reason
        ]);
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
