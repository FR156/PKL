// src/pages/LoginPage.js
import React, { useState } from "react";
import { PrimaryButton2 } from "../components/UI/Buttons";
import { login } from "../api/authService"; // ✅ gunakan langsung login dari authService.js
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

const COLORS = {
  Primary: "#000000ff",
};

const PrimaryButton = ({ children, className = "", disabled, ...props }) => {
  return (
    <button
      className={`
        px-6 py-3 font-semibold text-white rounded-2xl 
        bg-[${COLORS.Primary}] hover:bg-blue-600 
        shadow-lg shadow-blue-500/50 
        transition-all duration-300 ease-in-out 
        transform hover:scale-[1.02] active:scale-[0.98] 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`
      p-8 rounded-[30px] border border-white/50 
      bg-white/20 backdrop-blur-md shadow-xl 
      ${className}
    `}
  >
    {children}
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const isPasswordValid = password.length >= 8;
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // ✅ Perbaikan handleSubmit (tidak nested lagi)
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isPasswordValid) {
    alert("Password minimal 8 karakter");
    return;
  }

  setIsLoading(true);
  try {
    const userData = await login(username, password);

    if (!userData || !userData.id) {
      throw new Error("Login gagal, user tidak ditemukan");
    }

    setAuth({
      user: {
        id: userData.id,
        username: userData.name,
        device: userData.device || null,
        permissions: userData.permissions || [],
      },
      access_token: userData.token.access_token,
      refresh_token: userData.token.refresh_token,
    });

    console.log("✅ Login berhasil:", userData);
    // 🔧 Redirect ke employee dashboard setelah login berhasil
    navigate("/employee-dashboard");
  } catch (err) {
    console.error("❌ Login gagal:", err.response?.data || err.message);
    alert(err.response?.data?.message || err.message);
  } finally {
    setIsLoading(false);
  }
};



  const togglePasswordVisibility = () => setShowPassword(!showPassword); 

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#D3DFFE] p-4">
      <GlassCard className="w-full max-w-sm text-center transform transition-all duration-500 ">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#708993"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user mb-4"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">HRMS</h1>
          <p className="text-gray-500 text-sm mt-1">
            Human Resource Management System
          </p>
        </div>

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <div className="relative">
              <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-black"></i>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                required
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-2xl 
                  bg-white/50 backdrop-blur-sm shadow-sm 
                  placeholder-gray-600 text-gray-800 focus:outline-none 
                  ${!isUsernameFocused ? "border-white/50" : ""} 
                  ${isUsernameFocused ? "border-green-500" : ""}
                `}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-black"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                className={`
                  w-full pl-10 pr-12 py-3 border rounded-2xl 
                  bg-white/50 backdrop-blur-sm shadow-sm 
                  placeholder-gray-600 text-gray-800 focus:outline-none 
                  ${!isPasswordFocused ? "border-white/50" : ""}
                  ${
                    isPasswordFocused && !isPasswordValid
                      ? "border-red-500 "
                      : ""
                  }
                  ${
                    isPasswordFocused && isPasswordValid
                      ? "border-green-500"
                      : ""
                  }
                `}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-transparent focus:outline-none border-none"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
            </div>

            {isPasswordFocused && password.length > 0 && (
              <p
                className={`mt-1 text-xs text-left ${
                  isPasswordValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPasswordValid
                  ? ""
                  : `Minimal 8 karakter. Kurang ${8 - password.length} karakter.`}
              </p>
            )}
          </div>

          {/* Tombol Login */}
          <PrimaryButton2 type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i> Masuk
              </>
            )}
          </PrimaryButton2>
        </form>

        {/* Saran login */}
        <div className="mt-8 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Coba login sebagai:
          </p>
          <div className="space-y-1 text-xs text-left">
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
              <code className="bg-white/50 px-2 py-1 rounded">
                owner/password
              </code>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginPage;