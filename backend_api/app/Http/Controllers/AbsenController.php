<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absen;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AbsenController extends Controller
{
    // ✅ 1. Menampilkan semua absensi user yang sedang login
    public function index()
    {
        try {
            $user = Auth::user();
            $absensi = Absen::where('id_karyawan', $user->id)->orderBy('tanggal', 'desc')->get();

            if ($absensi->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada data absensi.',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data absensi ditemukan.',
                'data' => $absensi
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ 2. Proses Check-In
    public function checkIn(Request $request)
    {
        try {
            $user = Auth::user();

            $absenHariIni = Absen::where('id_karyawan', $user->id)
                ->whereDate('tanggal', Carbon::today())
                ->first();

            if ($absenHariIni) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamu sudah melakukan check-in hari ini!',
                ], 400);
            }

            $absen = Absen::create([
                'id_karyawan' => $user->id,
                'tanggal' => Carbon::today(),
                'jam_masuk' => Carbon::now()->toTimeString(),
                'status_absensi' => 'hadir',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'keterangan' => $request->keterangan ?? 'Check-in',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil!',
                'data' => $absen
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ✅ 3. Proses Check-Out
    public function checkOut(Request $request)
    {
        try {
            $user = Auth::user();

            $absenHariIni = Absen::where('id_karyawan', $user->id)
                ->whereDate('tanggal', Carbon::today())
                ->first();

            if (!$absenHariIni) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamu belum check-in hari ini!',
                ], 400);
            }

            if ($absenHariIni->jam_keluar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamu sudah check-out hari ini!',
                ], 400);
            }

            $absenHariIni->update([
                'jam_keluar' => Carbon::now()->toTimeString(),
                'keterangan' => $request->keterangan ?? 'Check-out',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil!',
                'data' => $absenHariIni
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ✅ 4. Semua absensi (untuk admin/HRD)
    public function allAbsensi()
    {
        try {
            $absensi = Absen::with('karyawan')->orderBy('tanggal', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Data seluruh absensi berhasil diambil.',
                'data' => $absensi
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
