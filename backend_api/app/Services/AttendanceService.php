<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceReason;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    const WORK_START_TIME = '08:00:00';
    const WORK_END_TIME = '17:00:00';
    const EARLIEST_CLOCK_IN = '06:00:00';
    const LATEST_CLOCK_IN = '10:00:00';
    const EARLIEST_CLOCK_OUT = '14:00:00';
    const LATEST_CLOCK_OUT = '20:00:00';

    public function getAllAttendances()
    {
        return Attendance::get();
    }

    public function getAttendanceById($id)
    {
        return Attendance::findOrFail($id);
    }

    public function getApprovedAttendances()
    {
        return Attendance::where('status', 'approved')->get();
    }

    public function clockIn(array $data, $userId)
    {
        $timestamp = Carbon::parse($data['timestamp']);
        
        $this->validateClockIn($timestamp, $userId);
        $this->validateClockInTime($timestamp);

        $checkInTime = $timestamp->format('H:i:s');
        $isLate = $checkInTime > self::WORK_START_TIME;

        if ($isLate && empty($data['description'])) {
            throw ValidationException::withMessages([
                'description' => ['You are late. Please provide a description for lateness.']
            ]);
        }

        return DB::transaction(function () use ($data, $isLate, $userId) {
            $attendance = Attendance::create([
                'account_id' => $userId,
                'type' => 'clock_in',
                'timestamp' => $data['timestamp'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'photo_path' => $data['photo_path'],
                'is_late' => $isLate,
                'status' => 'approved',
            ]);

            if ($isLate) {
                AttendanceReason::create([
                    'attendance_id' => $attendance->id,
                    'reason_type' => 'late',
                    'description' => $data['description'],
                    'review_status' => 'pending',
                ]);
            }

            return $attendance;
        });
    }

    public function clockOut(array $data, $userId, $isAuto = false)
    {
        $timestamp = Carbon::parse($data['timestamp']);
        
        if (!$isAuto) {
        $this->validateClockOut($timestamp, $userId);
        $this->validateClockOutTime($timestamp);

        $checkOutTime = $timestamp->format('H:i:s');
        $workEndTime = self::WORK_END_TIME;
        
        $isEarly = $checkOutTime < $workEndTime;
        $isLate = $checkOutTime > $workEndTime;
        $irregularClockout = $isEarly || $isLate;

        return DB::transaction(function () use ($data, $irregularClockout, $userId, $isEarly, $isLate, $isAuto) {
            $attendance = Attendance::create([
                'account_id' => $userId,
                'type' => 'clock_out',
                'timestamp' => $data['timestamp'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'photo_path' => $data['photo_path'],
                'status' => 'approved',
                'irregular_clockout' => $irregularClockout,
                'is_early_leave' => $isEarly,
                'is_auto_clockout' => $isAuto,
            ]);

            if ($irregularClockout) {
                $reasonType = $isAuto ? 'auto_clockout' : ($isEarly ? 'early_clockout' : 'late_clockout');
                
                // For manual early clock-out, require description
                if (!$isAuto && $isEarly && empty($data['description'])) {
                    throw new \Exception('Please provide a reason for early clock-out.');
                }

                AttendanceReason::create([
                    'attendance_id' => $attendance->id,
                    'reason_type' => $reasonType,
                    'description' => $isAuto ? 'Automatic clock-out by system at ' . $data['timestamp'] : ($data['description'] ?? null),
                    'review_status' => $isAuto ? 'approved' : 'pending', // Auto clock-outs auto-approved
                ]);
            }

            return $attendance;
        });
    }

    public function reviewAttendance($id, array $data, $reviewerId)
    {
        $attendance = Attendance::findOrFail($id);
        
        $attendance->update([
            'status' => $data['status'],
            'reason' => $data['reason'] ?? null,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        return $attendance;
    }

    public function deleteAttendance($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();
        
        return true;
    }

    protected function validateClockIn(Carbon $timestamp, $userId)
    {
        $dateToCheck = $timestamp->toDateString();
        
        $existingClockIn = Attendance::where('account_id', $userId)
            ->where('type', 'clock_in')
            ->whereDate('timestamp', $dateToCheck)
            ->first();

        if ($existingClockIn) {
            throw ValidationException::withMessages([
                'type' => ['You have already clocked in for this date.']
            ]);
        }
    }

    protected function validateClockOut(Carbon $timestamp, $userId)
    {
        $dateToCheck = $timestamp->toDateString();
        
        $todayClockIn = Attendance::where('account_id', $userId)
            ->where('type', 'clock_in')
            ->whereDate('timestamp', $dateToCheck)
            ->first();

        $todayClockOut = Attendance::where('account_id', $userId)
            ->where('type', 'clock_out')
            ->whereDate('timestamp', $dateToCheck)
            ->first();

        if (!$todayClockIn) {
            throw ValidationException::withMessages([
                'type' => ['You need to clock in first before clocking out.']
            ]);
        }

        if ($todayClockOut) {
            throw ValidationException::withMessages([
                'type' => ['You have already clocked out for this date.']
            ]);
        }
    }

    protected function validateClockInTime(Carbon $timestamp)
    {
        $checkInTime = $timestamp->format('H:i:s');
        
        if ($checkInTime < self::EARLIEST_CLOCK_IN) {
            throw ValidationException::withMessages([
                'timestamp' => ['Clock in is only allowed after ' . Carbon::parse(self::EARLIEST_CLOCK_IN)->format('g:i A')]
            ]);
        }
        
        if ($checkInTime > self::LATEST_CLOCK_IN) {
            throw ValidationException::withMessages([
                'timestamp' => ['Clock in is only allowed before ' . Carbon::parse(self::LATEST_CLOCK_IN)->format('g:i A')]
            ]);
        }
    }

    protected function validateClockOutTime(Carbon $timestamp)
    {
        $checkOutTime = $timestamp->format('H:i:s');
        
        if ($checkOutTime < self::EARLIEST_CLOCK_OUT) {
            throw ValidationException::withMessages([
                'timestamp' => ['Clock out is only allowed after ' . Carbon::parse(self::EARLIEST_CLOCK_OUT)->format('g:i A')]
            ]);
        }
        
        if ($checkOutTime > self::LATEST_CLOCK_OUT) {
            throw ValidationException::withMessages([
                'timestamp' => ['Clock out is only allowed before ' . Carbon::parse(self::LATEST_CLOCK_OUT)->format('g:i A')]
            ]);
        }
    }
}