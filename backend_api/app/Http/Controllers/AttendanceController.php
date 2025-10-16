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

    // POST /api/attendances (clock-in / clock-out dummy)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'photo_path' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'clock_in' => 'nullable|date',
            'clock_out' => 'nullable|date|after_or_equal:clock_in',
            'is_late' => 'boolean',
            'status' => 'required|in:present,auto,absent',
            'reviewed_by' => 'nullable|integer|exists:accounts,id',
            'reviewed_at' => 'nullable|date',
        ]);

        $validated['account_id'] = auth()->id(); // 🔥 ambil dari user login

        $attendance = Attendance::create($validated);

        return success('Attendance recorded successfully', $attendance);
    }

    // PUT /api/attendances/{id} 
    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        
        $validated = $request->validate([
            'photo_path' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'clock_in' => 'nullable|date',
            'clock_out' => 'nullable|date|after_or_equal:clock_in',
            'is_late' => 'boolean',
            'status' => 'required|in:present,auto,absent',
            'reviewed_by' => 'nullable|integer|exists:accounts,id',
            'reviewed_at' => 'nullable|date',
        ]);

        $attendance->update($validated);

        return success('Attendance updated successfully', $attendance);
    }

    // DELETE /api/attendances/{id}
    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return success('Attendance deleted successfully');
    }
}
