// src/api/authService.js
import axiosClient from "./axiosClient";

/**
 * 🔐 Login user dan simpan access_token + refresh_token ke localStorage.
 * Backend mengembalikan data:
 * {
 *   token: { access_token, refresh_token, expires_at },
 *   id, name, permissions
 * }
 */
export const login = async (name, password) => {
  try {
    const response = await axiosClient.post("/login", { name, password });
    const { token, id, name: username, permissions } = response.data.data;

    if (token?.access_token && token?.refresh_token) {
      localStorage.setItem("access_token", token.access_token);
      localStorage.setItem("refresh_token", token.refresh_token);

      axiosClient.defaults.headers.common.Authorization = `Bearer ${token.access_token}`;
    }

    return { user: { id, username, permissions }, token };
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    return Promise.reject(error);
  }
};

/**
 * 🚪 Logout user dari sistem (hapus token di backend & frontend)
 */
export const logout = async () => {
  try {
    await axiosClient.post("/logout");
  } catch (error) {
    console.warn("⚠️ Logout request failed:", error.response?.data || error.message);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete axiosClient.defaults.headers.common.Authorization;
  }
};

/**
 * 👤 Ambil data user yang sedang login
 */
export const getUser = async () => {
  try {
    const response = await axiosClient.get("/me");
    return response.data;
  } catch (error) {
    console.error("❌ Get user failed:", error.response?.data || error.message);
    return Promise.reject(error);
  }
};

/**
 * 🔁 Gunakan refresh_token untuk minta access_token baru.
 * Backend expects the refresh token via Authorization: Bearer <refresh_token>
 */
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.error("❌ No refresh token found");
    return null;
  }

  try {
    // Kirim refresh_token di header Authorization (bukan body!)
    const response = await axiosClient.post("/refresh", null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const newAccessToken = response.data.data?.token?.access_token;
    if (!newAccessToken) {
      console.error("❌ No new access token returned");
      return null;
    }

    localStorage.setItem("access_token", newAccessToken);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    console.log("🔁 Access token refreshed successfully");

    return newAccessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error.message);
    return null;
  }
};

/**
 * ⚙️ Setup header Authorization saat reload halaman
 */
export const setupAxiosAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};
