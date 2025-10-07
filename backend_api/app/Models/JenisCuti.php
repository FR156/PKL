<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisCuti extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terkait dengan model.
     * @var string
     */
    protected $table = 'jenis_cutis';

    /**
     * Primary Key untuk tabel.
     * @var string
     */
    protected $primaryKey = 'id_jenis_cuti';

    /**
     * Tipe data primary key.
     * @var string
     */
    protected $keyType = 'int';

    /**
     * Menandakan apakah primary key adalah auto-incrementing.
     * @var bool
     */
    public $incrementing = true;

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_cuti',
        'is_paid',
        'durasi_default',
        'reset_policy',
    ];

    /**
     * Atribut yang harus di-cast ke tipe tertentu.
     * @var array
     */
    protected $casts = [
        'durasi_default' => 'integer',
        'is_paid' => 'string',
        'reset_policy' => 'string',
    ];

    /**
     * Mendefinisikan relasi ke PengajuanCuti (jika diperlukan untuk hasMany).
     * Saat ini dikomentari karena JenisCutiController hanya Read-Only.
     */
    // public function pengajuanCutis()
    // {
    //     return $this->hasMany(PengajuanCuti::class, 'id_jenis_cuti', 'id_jenis_cuti');
    // }
}
