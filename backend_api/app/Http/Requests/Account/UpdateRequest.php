<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Tentukan apakah user diizinkan untuk memperbarui akun.
     * Permission dicek melalui Spatie Permission.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update accounts') ?? false;
    }

    /**
     * Aturan validasi untuk pembaruan akun.
     */
    public function rules(): array
    {
        $accountId = $this->route('id') ?? $this->route('account'); 
        // Sesuaikan dengan nama parameter route kamu (id/account)

        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:accounts,email,' . $accountId],
            'password' => ['nullable', 'string', 'min:6'],
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
            'email.unique'      => 'Email sudah digunakan oleh akun lain.',
            'password.min'      => 'Kata sandi minimal terdiri dari 6 karakter.',
            'role.required'     => 'Role wajib diisi.',
            'role.exists'       => 'Role yang dipilih tidak valid.',
        ];
    }
}
