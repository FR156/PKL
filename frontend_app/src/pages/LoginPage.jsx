// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { PrimaryButton, GlassCard } from "../components/componentsUtilityUI";
import { COLORS } from "../utils/constants";
import { login } from "../api/authService";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Handle login ke Laravel
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(name, password);
      console.log("Login berhasil:", response);
      alert("Login berhasil!");

      // Simpan token atau data user jika perlu
      // localStorage.setItem("token", response.token);
      // localStorage.setItem("role", response.user.role);

      // Contoh redirect sederhana:
      // window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login gagal:", error);
      alert("Nama atau password salah!");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordBorderColor = () => {
    if (!isPasswordFocused || password.length === 0)
      return "border-white/50";
    return password.length >= 8 ? "border-green-500" : "border-red-500";
  };

  const getPasswordRingColor = () => {
    if (!isPasswordFocused || password.length === 0)
      return "focus:ring-red-500";
    return password.length >= 8 ? "focus:ring-green-500" : "focus:ring-red-500";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background dekorasi */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <GlassCard className="w-full max-w-md p-8 md:p-10 text-center relative z-10 bg-white/30 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <i className="fas fa-fingerprint text-3xl text-white"></i>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          HRIS & Payroll System
        </h2>
        <p className="text-gray-600 mb-8">Masuk untuk melanjutkan</p>

        {/* ✅ Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input  
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="appearance-none relative block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base transition-all duration-200"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`appearance-none relative block w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border ${getPasswordBorderColor()} placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 ${getPasswordRingColor()} focus:border-transparent text-sm md:text-base transition-all duration-200`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              disabled={isLoading}
            />

            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <i className="fas fa-eye-slash text-gray-500 hover:text-gray-700"></i>
              ) : (
                <i className="fas fa-eye text-gray-500 hover:text-gray-700"></i>
              )}
            </button>

            {isPasswordFocused && password.length > 0 && password.length < 8 && (
              <p className="mt-2 text-xs text-red-500 text-left">
                Password harus minimal 8 karakter
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white/60 backdrop-blur-sm"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                Ingat saya
              </label>
            </div>
            <div className="text-xs sm:text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Lupa Password?
              </a>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i> Masuk
              </>
            )}
          </PrimaryButton>
        </form>

        <div className="mt-8 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Coba login sebagai:
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-700">
              <span className="font-medium">Karyawan:</span>{" "}
              <code className="bg-white/50 px-2 py-1 rounded">
                karyawan/password
              </code>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Manajer:</span>{" "}
              <code className="bg-white/50 px-2 py-1 rounded">
                manager/password
              </code>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Supervisor:</span>{" "}
              <code className="bg-white/50 px-2 py-1 rounded">
                supervisor/password
              </code>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Owner:</span>{" "}
              <code className="bg-white/50 px-2 py-1 rounded">owner/password</code>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
