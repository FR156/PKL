// src/api/axiosClient.js
import axios from "axios";
import { refreshToken } from "./authService";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // sesuaikan backend Mas
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🟢 Request Interceptor
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

// 🔁 Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kalau token invalid / expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn("⚠️ Access token expired, attempting refresh...");

      try {
        const newToken = await refreshToken();

        if (!newToken) {
          console.error("❌ Refresh token missing or invalid");
          handleLogout();
          return Promise.reject(error);
        }

        console.log("✅ Token refreshed successfully");

        // Simpan token baru
        localStorage.setItem("access_token", newToken);
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Ulang request lama
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token request failed:", refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Kalau refresh token juga expired
    if (error.response?.status === 401 && originalRequest._retry) {
      console.warn("⚠️ Second 401 detected, forcing logout...");
      handleLogout();
    }

    return Promise.reject(error);
  }
);

// 🔒 Fungsi bantu logout aman
function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

export default axiosClient;
