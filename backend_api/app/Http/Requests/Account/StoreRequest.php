<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Tentukan apakah user diizinkan untuk membuat akun baru.
     * Permission dicek melalui Spatie Permission.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create accounts') ?? false;
    }

    /**
     * Aturan validasi untuk pembuatan akun baru.
     */
    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:accounts,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'string', 'exists:roles,name'],
        ];
    }

    /**
     * Pesan kustom untuk error validasi.
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'Nama akun wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email sudah digunakan.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min'      => 'Kata sandi minimal terdiri dari 8 karakter.',
            'role.required'     => 'Role wajib diisi.',
            'role.exists'       => 'Role yang dipilih tidak valid.',
        ];
    }
}
