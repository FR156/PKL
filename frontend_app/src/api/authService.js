// src/api/authService.js
import axiosClient from "./axiosClient";
import useAuthStore from "../store/authStore";

// 🔒 Prevent duplicate login requests
let loginController = null;

/**
 * 🔐 LOGIN USER — Simpan access_token & refresh_token ke store (persist otomatis)
 */
export const login = async (name, password) => {
  // 🔒 Cancel previous login request jika masih pending
  if (loginController) {
    loginController.abort('Duplicate login request cancelled');
  }

  loginController = new AbortController();

  try {
    // 🔸 Kirim request ke backend
    const response = await axiosClient.post(
      "/login",
      { name, password },
      { 
        headers: { "X-Device-Name": "web" },
        signal: loginController.signal // 🔒 Attach abort signal
      }
    );

    console.log("🟢 Response full:", response.data);

    // 🔒 Reset controller setelah success
    loginController = null;

    // 🔸 Validasi response structure
    if (!response.data?.success?.data) {
      throw new Error("Invalid response structure from server");
    }

    const userData = response.data.success.data;
    const accessToken = userData.token?.access_token;
    const refreshToken = userData.token?.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error("Token tidak ditemukan di response backend");
    }

    // 🔸 Gunakan setAuth agar sesuai dengan LoginPage.js
    // Struktur data disesuaikan dengan LoginPage.js
    useAuthStore.getState().setAuth({
      user: {
        id: userData.id,
        name: userData.name, // Pastikan nama field sesuai dengan LoginPage.js (username -> name)
        device: userData.device,
        permissions: userData.permissions || [],
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // 🔸 Update header global axios agar langsung pakai token
    axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    console.log("✅ Login success, token & user stored");
    // Kembalikan data yang sesuai dengan struktur LoginPage.js
    return {
      id: userData.id,
      name: userData.name,
      device: userData.device,
      permissions: userData.permissions || [],
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    };
  } catch (error) {
    // 🔒 Reset controller pada error
    loginController = null;

    // Handle abort differently
    if (error.name === 'AbortError') {
      console.warn('🟡 Login request was cancelled');
      throw new Error('Login request cancelled');
    }

    // Handle axios error
    if (error.response) {
      // Server responded with error status
      // Perbaikan: Tidak menyimpan token jika login gagal
      const errorMessage = error.response.data?.message || 'Login failed';
      console.error("❌ Login failed:", errorMessage);
      
      // Jika login gagal, pastikan tidak ada token yang tersimpan
      useAuthStore.getState().logout();
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // No response received
      console.error("❌ No response from server");
      throw new Error('No response from server. Check your connection.');
    } else {
      // Other errors
      console.error("❌ Login error:", error.message);
      
      // Jika terjadi error lain, pastikan tidak ada token yang tersimpan
      useAuthStore.getState().logout();
      
      throw error;
    }
  }
};

/**
 * 🚪 LOGOUT — Hapus token di backend & frontend
 */
export const logout = async () => {
  // 🔒 Cancel any ongoing login request on logout
  if (loginController) {
    loginController.abort('Login cancelled due to logout');
    loginController = null;
  }

  try {
    await axiosClient.post("/logout");
  } catch (error) {
    console.warn("⚠️ Logout request failed:", error.response?.data || error.message);
  } finally {
    const store = useAuthStore.getState();

    // ✅ Bersihkan store dan localStorage
    store.logout();

    // ✅ Hapus Authorization header
    delete axiosClient.defaults.headers.common.Authorization;

    console.log("👋 Logged out and store cleared");
  }
};

/**
 * 👤 AMBIL DATA USER YANG SEDANG LOGIN
 */
export const getUser = async () => {
  try {
    const response = await axiosClient.get("/me");
    return response.data;
  } catch (error) {
    console.error("❌ Get user failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔁 REFRESH TOKEN — Gunakan refresh_token untuk ambil access_token baru
 */
export const refreshToken = async () => {
  const store = useAuthStore.getState();
  const refresh_token = store.refresh_token;

  if (!refresh_token) {
    console.error("❌ No refresh token found");
    return null;
  }

  try {
    const response = await axiosClient.post("/refresh", null, {
      headers: { Authorization: `Bearer ${refresh_token}` },
    });

    const newAccessToken = response.data?.success?.data?.token?.access_token;
    if (!newAccessToken) {
      console.error("❌ No new access token returned");
      return null;
    }

    // ✅ Gunakan setAuth agar konsisten
    store.setAuth({
      user: store.user,
      access_token: newAccessToken,
      refresh_token,
    });

    // ✅ Update header axios global
    axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    console.log("🔁 Access token refreshed successfully");

    return newAccessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error.message);
    return null;
  }
};

/**
 * ⚙️ SETUP TOKEN SAAT HALAMAN DIREFRESH
 */
export const setupAxiosAuthHeader = () => {
  const { access_token } = useAuthStore.getState();
  if (access_token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
  }
};

/**
 * 🔒 Cancel ongoing login request
 */
export const cancelLogin = () => {
  if (loginController) {
    loginController.abort('Login cancelled by user');
    loginController = null;
  }
};