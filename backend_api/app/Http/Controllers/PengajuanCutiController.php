<?php

namespace App\Http\Controllers;

use App\Models\PengajuanCuti;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\Response;

class PengajuanCutiController extends Controller
{
    /**
     * Menampilkan daftar semua Pengajuan Cuti (GET /api/pengajuan_cuti).
     * Mengembalikan Collection yang diubah Laravel menjadi JSON.
     */
    public function index()
    {
        // Menggunakan with untuk mengambil data relasi karyawan dan jenis cuti
        return PengajuanCuti::with(['karyawan', 'jenisCuti'])->latest()->get();
    }

    /**
     * Menyimpan Pengajuan Cuti baru (POST /api/pengajuan_cuti).
     * Mengembalikan PengajuanCuti baru dengan status 201 Created.
     */
    public function store(Request $request): Response
    {
        // Catatan: Pastikan id_karyawan diisi, baik dari request (jika Admin)
        // atau dari data user yang sedang terautentikasi (jika Karyawan).
        $validated = $request->validate([
            'id_karyawan' => 'required|exists:karyawan,id',
            'id_jenis_cuti' => 'required|exists:jenis_cutis,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'required|string|max:255',
            // Status defaultnya biasanya 'pending' diisi oleh Model
        ]);

        $pengajuanCuti = PengajuanCuti::create($validated);

        // Mengembalikan objek yang baru dibuat dengan status HTTP 201 (Created)
        return response($pengajuanCuti, 201);
    }

    /**
     * Menampilkan detail Pengajuan Cuti tertentu (GET /api/pengajuan_cuti/{id}).
     * Mengembalikan Model tunggal yang diubah Laravel menjadi JSON.
     */
    public function show(string $id_pengajuan_cuti)
    {
        // Menggunakan findOrFail yang akan otomatis melempar 404 jika tidak ditemukan
        return PengajuanCuti::with(['karyawan', 'jenisCuti'])->findOrFail($id_pengajuan_cuti);
    }

    /**
     * Memperbarui Pengajuan Cuti tertentu (PUT/PATCH /api/pengajuan_cuti/{id}).
     * Digunakan untuk mengedit data atau untuk aksi persetujuan/penolakan (update status).
     * Mengembalikan Model yang sudah diperbarui.
     */
    public function update(Request $request, string $id_pengajuan_cuti)
    {
        $pengajuanCuti = PengajuanCuti::findOrFail($id_pengajuan_cuti);

        // Validasi data yang diizinkan untuk diubah
        $validated = $request->validate([
            'id_jenis_cuti' => 'sometimes|required|exists:jenis_cutis,id',
            'tanggal_mulai' => 'sometimes|required|date',
            'tanggal_selesai' => 'sometimes|required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'sometimes|required|string|max:255',
            // Rule::in ini penting untuk persetujuan oleh Supervisor/Admin
            'status' => ['sometimes', 'required', Rule::in(['pending', 'disetujui', 'ditolak'])],
        ]);

        $pengajuanCuti->update($validated);

        // Mengembalikan objek yang sudah diperbarui (akan menjadi respons JSON)
        return $pengajuanCuti;
    }

    /**
     * Menghapus Pengajuan Cuti dari database (DELETE /api/pengajuan_cuti/{id}).
     * Mengembalikan status 204 No Content.
     */
    public function destroy(string $id_pengajuan_cuti): Response
    {
        $pengajuanCuti = PengajuanCuti::findOrFail($id_pengajuan_cuti);
        $pengajuanCuti->delete();

        // Mengembalikan respons HTTP 204 No Content (Standar API untuk DELETE yang sukses)
        return response()->noContent();
    }
}
