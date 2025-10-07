<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaldoCuti extends Model
{
    use HasFactory;

    protected $table = 'saldo_cutis';
    protected $primaryKey = 'id_saldo_cuti';

    protected $fillable = [
        'id_karyawan',
        'id_jenis_cuti',
        'tahun',
        'saldo',
    ];

    // Relasi ke tabel Karyawan
    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }

    // Relasi ke tabel Jenis Cuti
    public function jenisCuti()
    {
        return $this->belongsTo(JenisCuti::class, 'id_jenis_cuti');
    }
}
