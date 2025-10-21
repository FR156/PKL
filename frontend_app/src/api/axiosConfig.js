// src/api/axiosConfig.js

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Instance utama axios — digunakan untuk request biasa (tanpa refresh logic)
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // ganti sesuai port backend Laravel
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // wajib untuk Sanctum
});

// Interceptor request → otomatis sisipkan token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tidak perlu interceptor response di sini,
// karena refresh token sudah ditangani oleh axiosClient.js
// Jadi file ini hanya untuk request biasa agar tetap clean dan ringan.

export default api;
