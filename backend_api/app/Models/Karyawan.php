<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    protected $fillable = ['nama', 'email'];

    public function absens()
    {
        return $this->hasMany(Absen::class, 'id_karyawan');
    }
}
