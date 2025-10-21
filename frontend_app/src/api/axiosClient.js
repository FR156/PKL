// src/api/axiosClient.js
import axios from "axios";
import { refreshToken } from "./authService";
import useAuthStore from "../store/authStore";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🟢 Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🔒 Always include device name
    if (!config.headers['X-Device-Name']) {
      config.headers['X-Device-Name'] = 'web';
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
    const { refresh_token, setUserData, logout } = useAuthStore.getState();

    // 🔒 Skip if request was aborted
    if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
      return Promise.reject(error);
    }

    // Kalau access token expired (401) dan belum di-retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("⚠️ Access token expired, attempting refresh...");

      // 🔒 Skip refresh untuk endpoint login (karena belum punya token)
      if (originalRequest.url === '/login') {
        return Promise.reject(error);
      }

      try {
        const newToken = await refreshToken();

        if (newToken) {
          console.log("✅ Token refreshed successfully");

          // Update header token untuk request selanjutnya
          axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Ulang request lama
          return axiosClient(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        console.error("❌ Refresh token request failed:", refreshError);
        
        // 🔒 Force logout hanya jika bukan request login
        if (originalRequest.url !== '/login') {
          logout();
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Kalau refresh token juga expired atau error lain
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 detected, checking if logout needed...");
      
      // 🔒 Jangan logout untuk login endpoint
      if (originalRequest.url !== '/login') {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;