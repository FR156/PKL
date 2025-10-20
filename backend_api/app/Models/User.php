<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Account;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'nik',
        'phone',
        'email',
        'address',
        'gender',
        'birth_place',
        'birth_date',
        'position',
        'division',
        'hired_at',
        'employment_status',
        'resigned_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hired_at' => 'date',
        'resigned_at' => 'date',
    ];

    // Relasi ke akun login
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    // Contoh: relasi ke absensi, log, dsb (nanti bisa ditambah)
    // public function attendances() { return $this->hasMany(Attendance::class); }
}
