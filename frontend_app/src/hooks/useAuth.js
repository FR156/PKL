// src/hooks/useAuth.js
import { useState, useEffect, useRef } from "react";
import { showSwal } from "../utils/constants";
import { login, logout, getUser, setupAxiosAuthHeader } from "../api/authService";

export const useAuth = () => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("authUser")) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Simpan timer refresh agar bisa dibatalkan
  const refreshTimerRef = useRef(null);

  // =====================
  // 🟢 LOGIN FUNCTION
  // =====================
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const userData = res.user;
      const tokenData = {
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        expired_at: res.expired_at,
      };

      // Simpan ke localStorage
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.setItem("token", tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token);
      localStorage.setItem("expired_at", tokenData.expired_at);

      setAuthUser(userData);
      showSwal("Login Berhasil!", `Selamat datang, ${userData.name}!`, "success", 2000);

      // Jadwalkan refresh otomatis
      scheduleTokenRefresh(tokenData.expired_at);
    } catch (error) {
      console.error("Login error:", error);
      showSwal("Login gagal", "Email atau password salah", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================
  // 🟠 LOGOUT FUNCTION
  // =====================
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    clearRefreshTimer();
    localStorage.clear();
    setAuthUser(null);
    setIsLogoutModalOpen(false);
    showSwal("Logout Sukses", "Anda telah keluar.", "success", 1500);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // =====================
  // 🔄 REFRESH TOKEN AUTO
  // =====================
  const scheduleTokenRefresh = (expiredAt) => {
    clearRefreshTimer();
    const expireTime = new Date(expiredAt).getTime();
    const now = Date.now();
    const refreshTime = expireTime - now - 60000; // refresh 1 menit sebelum expired

    if (refreshTime > 0) {
      refreshTimerRef.current = setTimeout(async () => {
        try {
          const res = await authService.refreshToken();
          const newToken = res.access_token;
          const newExpiredAt = res.expired_at;

          localStorage.setItem("token", newToken);
          localStorage.setItem("expired_at", newExpiredAt);

          showSwal("Token diperbarui", "Sesi login kamu tetap aktif.", "success", 1000);
          scheduleTokenRefresh(newExpiredAt);
        } catch (err) {
          console.error("Gagal refresh token:", err);
          showSwal("Sesi habis", "Silakan login ulang.", "warning");
          handleLogout();
        }
      }, refreshTime);
    }
  };

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  // =====================
  // 🔁 USE EFFECT
  // =====================
  useEffect(() => {
    if (authUser) {
      const expiredAt = localStorage.getItem("expired_at");
      if (expiredAt) {
        scheduleTokenRefresh(expiredAt);
      }
    }
    return () => clearRefreshTimer();
  }, [authUser]);

  return {
    authUser,
    setAuthUser,
    isLoading,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogin,
    handleLogout,
    handleLogoutClick,
  };
};
