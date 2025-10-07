<?php

namespace App\Http\Controllers;

use App\Models\JenisCuti;
use Illuminate\Http\Request;
// Tidak perlu Rule, View, atau RedirectResponse karena ini adalah API Read-Only

class JenisCutiController extends Controller
{
    /**
     * Menampilkan daftar semua Jenis Cuti dan mendukung pencarian (GET /api/jenis_cuti?search=keyword).
     * Mengembalikan raw data JenisCuti (dikonversi Laravel ke JSON secara otomatis).
     */
    public function index(Request $request)
    {
        $query = JenisCuti::query();
        $search = $request->query('search'); // Mengambil parameter 'search'

        if ($search) {
            // Logika pencarian: mencari nama_cuti yang mengandung keyword
            $query->where('nama_cuti', 'like', '%' . $search . '%');
        }

        // Mengembalikan data mentah. Laravel akan otomatis mengkonversinya menjadi JSON.
        return $query->get();
    }

    /**
     * Menampilkan Jenis Cuti tertentu (GET /api/jenis_cuti/{id}).
     * Mengembalikan raw data JenisCuti tunggal.
     */
    public function show(string $id_jenis_cuti)
    {
        // findOrFail akan otomatis melempar 404 Not Found jika tidak ditemukan.
        // Data Model yang ditemukan akan otomatis dikonversi menjadi JSON.
        return JenisCuti::findOrFail($id_jenis_cuti);
    }

    // Metode 'store', 'update', dan 'destroy' Dihapus
    // karena rute /api/jenis_cuti hanya diatur sebagai Read-Only (index & show)
}
