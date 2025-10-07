<?php

namespace App\Http\Controllers;

use App\Models\SaldoCuti;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException; // Untuk penanganan error duplikasi

class SaldoCutiController extends Controller
{
    /**
     * Menampilkan daftar semua Saldo Cuti (GET /api/saldo_cuti).
     * Mengembalikan Collection yang diubah Laravel menjadi JSON.
     */
    public function index()
    {
        // Eager load relasi karyawan dan jenis cuti
        return SaldoCuti::with(['karyawan', 'jenisCuti'])->latest()->get();
    }

    /**
     * Menyimpan Saldo Cuti baru (POST /api/saldo_cuti).
     * Mengembalikan model SaldoCuti baru dengan status 201 Created.
     */
    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'id_karyawan' => 'required|exists:karyawans,id', // Sesuaikan dengan PK di 'karyawans'
            'id_jenis_cuti' => 'required|exists:jenis_cutis,id_jenis_cuti',
            // Gunakan format 'required|date' jika 'tahun' benar-benar menyimpan format tanggal lengkap
            // atau 'required|integer|min:2020' jika hanya menyimpan tahun.
            'tahun' => 'required|date_format:Y-m-d',
            'saldo' => 'required|integer|min:0',
        ]);

        // Cek duplikasi saldo (logika penting untuk API)
        $existing = SaldoCuti::where('id_karyawan', $validated['id_karyawan'])
                              ->where('id_jenis_cuti', $validated['id_jenis_cuti'])
                              ->whereYear('tahun', date('Y', strtotime($validated['tahun'])))
                              ->exists();

        if ($existing) {
            // Melempar error validasi standar API (Status 422 Unprocessable Entity)
            throw ValidationException::withMessages([
                'tahun' => ['Saldo cuti untuk jenis dan tahun ini sudah ada. Gunakan PUT untuk memperbarui.'],
            ]);
        }

        $saldoCuti = SaldoCuti::create($validated);

        // Mengembalikan objek yang baru dibuat dengan status HTTP 201 (Created)
        return response($saldoCuti, 201);
    }

    /**
     * Menampilkan Saldo Cuti tertentu (GET /api/saldo_cuti/{id}).
     * Mengembalikan model SaldoCuti tunggal yang diubah Laravel menjadi JSON.
     */
    public function show(string $id_saldo_cuti)
    {
        // findOrFail akan otomatis melempar 404 jika tidak ditemukan.
        return SaldoCuti::with(['karyawan', 'jenisCuti'])->findOrFail($id_saldo_cuti);
    }

    /**
     * Memperbarui Saldo Cuti tertentu di database (PUT/PATCH /api/saldo_cuti/{id}).
     * Mengembalikan model yang sudah diperbarui.
     */
    public function update(Request $request, string $id_saldo_cuti)
    {
        $saldoCuti = SaldoCuti::findOrFail($id_saldo_cuti);

        // Hanya saldo yang boleh diubah
        $validated = $request->validate([
            'saldo' => 'required|integer|min:0',
            // id_karyawan, id_jenis_cuti, dan tahun tidak boleh diubah setelah dibuat
        ]);

        $saldoCuti->update($validated);

        // Mengembalikan objek yang sudah diperbarui (akan menjadi respons JSON)
        return $saldoCuti;
    }

    // Metode 'create', 'edit', dan 'destroy' Dihapus karena tidak ada di rute API.
}
