import axios from "axios";
import { refreshToken } from "./authService";

// Buat instance axios utama
const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Ganti kalau backend beda
  timeout: 5000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🟢 Interceptor Request — otomatis tambah Authorization header kalau ada token
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Interceptor Response — kalau token kadaluarsa (401), refresh otomatis
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Cegah infinite loop refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Coba refresh token
        const newToken = await refreshToken();

        // Kalau berhasil dapat token baru, update header dan ulang request
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          axiosClient.defaults.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
        // Hapus semua data & arahkan ke login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
