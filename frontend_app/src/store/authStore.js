// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosClient from "../api/axiosClient";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isLoading: false, // 🔒 NEW: Track loading state

      /**
       * 🔐 Set user & token setelah login berhasil
       */
      setAuth: ({ user, token, refreshToken }) => {
        if (token) {
          axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        }

        set({
          user,
          access_token: token,
          refresh_token: refreshToken,
          isLoading: false, // 🔒 Reset loading state
        });
      },

      /**
       * 🔐 Alias untuk kompatibilitas dengan authService
       */
      setUserData: ({ user, access_token, refresh_token }) => {
        if (access_token) {
          axiosClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        }

        set({
          user,
          access_token,
          refresh_token,
          isLoading: false, // 🔒 Reset loading state
        });
      },

      /**
       * 🚪 Logout
       */
      // Di dalam authStore.js, tambahkan ini:
logout: () => {
  delete axiosClient.defaults.headers.common.Authorization;
  set({ 
    user: null, 
    access_token: null, 
    refresh_token: null,
    isLoading: false
  });
  localStorage.removeItem("auth-storage");
},

      /**
       * ⚙️ Setup header Authorization ulang saat reload halaman
       */
      setupAxiosAuthHeader: () => {
        const access_token = get().access_token;
        if (access_token) {
          axiosClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        }
      },

      // 🔒 NEW: Loading state management
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        // 🔒 Don't persist isLoading
      }),
    }
  )
);

export default useAuthStore;