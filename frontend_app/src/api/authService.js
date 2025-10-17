import axiosClient from "./axiosClient";

/**
 * 🔐 Login user dan simpan access_token + refresh_token ke localStorage.
 * Backend mengembalikan { access_token, refresh_token, user }
 */
export const login = async (name, password) => {
  try {
    const response = await axiosClient.post("/login", { name, password });

    const { access_token, refresh_token, user } = response.data;

    if (access_token && refresh_token) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Set header Authorization default
      axiosClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;
    }

    return { user, access_token, refresh_token };
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    throw error;
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
    // Hapus token di localStorage & header Authorization
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete axiosClient.defaults.headers.common["Authorization"];
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
    throw error;
  }
};

/**
 * 🔁 Gunakan refresh_token untuk minta access_token baru
 */
export const refreshToken = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) throw new Error("No refresh token found");

    const response = await axiosClient.post("/refresh", { refresh_token });

    const newAccessToken = response.data.access_token;
    if (!newAccessToken) throw new Error("No new access token returned");

    localStorage.setItem("access_token", newAccessToken);
    axiosClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${newAccessToken}`;

    console.log("🔁 Access token refreshed successfully");
    return newAccessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * ⚙️ Setup header Authorization saat reload halaman
 */
export const setupAxiosAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
