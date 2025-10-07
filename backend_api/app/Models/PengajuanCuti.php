<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengajuanCuti extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terkait dengan model.
     * @var string
     */
    protected $table = 'pengajuan_cutis';

    /**
     * Primary Key untuk tabel.
     * Menggunakan 'id_pengajuan_cuti' sesuai migration.
     * @var string
     */
    protected $primaryKey = 'id_pengajuan_cuti';

    /**
     * Tipe data primary key.
     * @var string
     */
    protected $keyType = 'int';

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     * @var array<int, string>
     */
    protected $fillable = [
        'id_jenis_cuti',
        'id_karyawan',
        'tanggal_mulai',
        'tanggal_selesai',
        'alasan',
        'status', // Defaultnya 'menunggu' tapi tetap diizinkan diisi
    ];

    /**
     * Atribut yang harus di-cast ke tipe tertentu.
     * @var array
     */
    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    // --- Definisi Relasi ---

    /**
     * Relasi ke model JenisCuti.
     */
    public function jenisCuti(): BelongsTo
    {
        return $this->belongsTo(JenisCuti::class, 'id_jenis_cuti', 'id_jenis_cuti');
    }

    /**
     * Relasi ke model Karyawan (Asumsi nama model Anda adalah Karyawan dan PK-nya 'id').
     */
    public function karyawan(): BelongsTo
    {
        // Asumsi Model Karyawan menggunakan primary key 'id' (default Laravel)
        return $this->belongsTo(Karyawan::class, 'id_karyawan', 'id');
    }
}
