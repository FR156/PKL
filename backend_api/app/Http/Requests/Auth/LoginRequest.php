<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Izinkan semua user untuk akses form request ini.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Rules validasi untuk login.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'password' => 'required|string',
        ];
    }

    /**
     * Custom message untuk error validasi.
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'Nama pengguna wajib diisi.',
            'name.string'       => 'Nama pengguna harus berupa teks.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.string'   => 'Kata sandi harus berupa teks.',
        ];
    }
}
