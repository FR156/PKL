import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { setupAxiosAuthHeader } from "./api/authService";
setupAxiosAuthHeader();

// Import global style (pastikan file ini ada)
import "./styles/index.css";
import "./styles/App.css";

// Import auth store untuk setup token Authorization otomatis
import useAuthStore from "./store/authStore";

// Setup axios header ketika halaman di-refresh
useAuthStore.getState().setupAxiosAuthHeader();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
