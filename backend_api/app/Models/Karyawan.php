<?php

namespace App\Models;

// Import yang diperlukan untuk otentikasi dan API Token
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Karyawan sekarang meng-extend Authenticatable
class Karyawan extends Authenticatable
{
    // Tambahkan trait untuk Token, Factory, dan Notifikasi
    use HasApiTokens, HasFactory, Notifiable;

    // Tambahkan 'password' ke fillable, karena ini dibutuhkan untuk otentikasi
    protected $fillable = ['nama', 'email', 'password'];

    // Field tersembunyi (seperti di model User default)
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts attribute, termasuk meng-hash password secara otomatis
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Relasi ke tabel absens
    public function absens()
    {
        // Sesuaikan jika foreign key di tabel absens adalah 'user_id'
        // Jika foreign key di tabel absens adalah 'id_karyawan', kode Anda sudah benar
        return $this->hasMany(Absen::class, 'id_karyawan');
    }
}
