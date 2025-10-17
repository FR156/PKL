// src/api/axiosConfig.js

import axios from 'axios';

// Membuat instance Axios dengan konfigurasi dasar
const api = axios.create({
  // WAJIB GANTI jika server Laravel Anda menggunakan port selain 8000
  baseURL: 'http://localhost:8000/api', 
  
  headers: {
    'Content-Type': 'application/json',
  },
  
  // WAJIB untuk Sanctum: Memungkinkan browser mengirim dan menerima cookies 
  // (termasuk cookie XSRF-TOKEN dan session ID).
  withCredentials: true, 
});

export default api;