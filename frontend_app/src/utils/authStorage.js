// src/utils/authStorage.js

// Kunci penyimpanan di localStorage
const STORAGE_KEY = 'authData';

export const authStorage = {
  // Simpan data auth ke localStorage
  setAuth: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Gagal menyimpan ke localStorage:', err);
    }
  },

  // Ambil data auth dari localStorage
  getAuth: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Gagal membaca localStorage:', err);
      return null;
    }
  },

  // Hapus data auth (logout)
  clearAuth: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Gagal menghapus localStorage:', err);
    }
  },
};
