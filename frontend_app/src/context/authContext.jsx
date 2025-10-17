import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as loginApi, logout as logoutApi, getUser, refreshToken, setupAxiosAuthHeader } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Setup token dari localStorage saat app pertama kali dibuka
  useEffect(() => {
    setupAxiosAuthHeader();
    initUser();
  }, []);

  // 🔹 Ambil user info dari server
  const initUser = async () => {
    try {
      const data = await getUser();
      setUser(data.user);
      setIsAuthenticated(true);
      handleAutoRefreshToken();
    } catch (err) {
      console.warn("User belum login:", err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Fungsi login
  const login = async (name, password) => {
    const data = await loginApi(name, password);
    setUser(data.user);
    setIsAuthenticated(true);
    handleAutoRefreshToken();
  };

  // 🚪 Fungsi logout
  const logout = async () => {
    await logoutApi();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 🔁 Fungsi auto refresh token (1 menit sebelum expired)
  const handleAutoRefreshToken = useCallback(() => {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return;

    const now = Date.now();
    const timeLeft = new Date(expiresAt).getTime() - now;
    const refreshTime = timeLeft - 60000; // 1 menit sebelum expired

    if (refreshTime > 0) {
      setTimeout(async () => {
        console.log("⏳ Refreshing token automatically...");
        await refreshToken();
        handleAutoRefreshToken(); // jadwalkan lagi setelah diperbarui
      }, refreshTime);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
