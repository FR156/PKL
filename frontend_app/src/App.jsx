// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // 🧩 Tambahkan Navigate
import { useAuth } from "./hooks/useAuth.js";

import Header from "./components/Shared/Header.jsx";
import LogoutModal from "./components/Shared/Modals/LogoutModal.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EmployeeDashboard from "./pages/Dashboard/EmployeeDashboard.jsx";
import ManagerDashboard from "./pages/Dashboard/ManagerDashboard.jsx";
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard/OwnerDashboard.jsx";
import SupervisorDashboard from "./pages/Dashboard/SupervisorDashboard.jsx";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const App = () => {
  const {
    authUser,
    isLoading,
    employees,
    setEmployees,
    managers,
    setManagers,
    pendingLeave,
    setPendingLeave,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogin,
    handleLogout,
    handleLogoutClick,
    setAuthUser,
  } = useAuth();

  const [workSettings, setWorkSettings] = useState(() => {
    const saved = localStorage.getItem("workSettings");
    return saved
      ? JSON.parse(saved)
      : {
          startTime: "08:00",
          endTime: "17:00",
          lateDeduction: 50000,
          earlyLeaveDeduction: 75000,
        };
  });

  const [pendingProfileChanges, setPendingProfileChanges] = useState(() => {
    const saved = localStorage.getItem("pendingProfileChanges");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (workSettings) {
      localStorage.setItem("workSettings", JSON.stringify(workSettings));
    }
  }, [workSettings]);

  useEffect(() => {
    localStorage.setItem(
      "pendingProfileChanges",
      JSON.stringify(pendingProfileChanges)
    );
  }, [pendingProfileChanges]);

  return (
    <BrowserRouter>
      {/* Wrapper router dibuka di sini */}
      <div className="min-h-screen bg-gray-50">
        {isLoading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="flex flex-col items-center justify-center">
              <div className="h-48 w-48 mb-4">
                <DotLottieReact
                  src="https://lottie.host/9581a0e7-e2e2-4ac9-afbd-7d4cface4c28/O3EfZ0vhqK.lottie  "
                  loop
                  autoplay
                />
              </div>
              <p className="mt-2 text-lg font-bold text-[#708993] tracking-wider text-shadow-sm">
                LOADING...
              </p>
            </div>
          </div>
        )}

        <Routes>
          {/* Route untuk Login - sekarang hanya di /login */}
          <Route
            path="/login"
            element={
              !authUser ? (
                <LoginPage handleLogin={handleLogin} isLoading={isLoading} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Route untuk Dashboard Employee */}
          <Route
            path="/employee-dashboard"
            element={
              authUser ? (
                <>
                  <Header user={authUser} handleLogoutClick={handleLogoutClick} />
                  <main className="pt-4">
                    <EmployeeDashboard
                      user={authUser}
                      employees={employees}
                      setEmployees={setEmployees}
                      pendingLeave={pendingLeave}
                      workSettings={workSettings}
                      setAuthUser={setAuthUser}
                      pendingProfileChanges={pendingProfileChanges}
                      setPendingProfileChanges={setPendingProfileChanges}
                    />
                  </main>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Route untuk Dashboard berdasarkan role */}
          <Route
            path="/"
            element={
              authUser ? (
                <>
                  <Header user={authUser} handleLogoutClick={handleLogoutClick} />
                  <main className="pt-4">
                    {authUser.role === "employee" && (
                      <EmployeeDashboard
                        user={authUser}
                        employees={employees}
                        setEmployees={setEmployees}
                        pendingLeave={pendingLeave}
                        workSettings={workSettings}
                        setAuthUser={setAuthUser}
                        pendingProfileChanges={pendingProfileChanges}
                        setPendingProfileChanges={setPendingProfileChanges}
                      />
                    )}

                    {authUser.role === "manager" && (
                      <ManagerDashboard
                        user={authUser}
                        employees={employees}
                        setEmployees={setEmployees}
                        pendingLeave={pendingLeave}
                        setPendingLeave={setPendingLeave}
                        workSettings={workSettings}
                        pendingProfileChanges={pendingProfileChanges}
                        setPendingProfileChanges={setPendingProfileChanges}
                      />
                    )}

                    {authUser.role === "owner" && (
                      <OwnerDashboard
                        user={authUser}
                        managers={managers}
                        setManagers={setManagers}
                        employees={employees}
                        setEmployees={setEmployees}
                        workSettings={workSettings}
                        setWorkSettings={setWorkSettings}
                      />
                    )}

                    {authUser.role === "supervisor" && (
                      <SupervisorDashboard
                        user={authUser}
                        employees={employees}
                        setEmployees={setEmployees}
                        workSettings={workSettings}
                      />
                    )}
                  </main>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Tambahkan route individual untuk masing-masing dashboard jika diperlukan */}
          <Route
            path="/manager-dashboard"
            element={
              authUser ? (
                <>
                  <Header user={authUser} handleLogoutClick={handleLogoutClick} />
                  <main className="pt-4">
                    <ManagerDashboard
                      user={authUser}
                      employees={employees}
                      setEmployees={setEmployees}
                      pendingLeave={pendingLeave}
                      setPendingLeave={setPendingLeave}
                      workSettings={workSettings}
                      pendingProfileChanges={pendingProfileChanges}
                      setPendingProfileChanges={setPendingProfileChanges}
                    />
                  </main>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/owner-dashboard"
            element={
              authUser ? (
                <>
                  <Header user={authUser} handleLogoutClick={handleLogoutClick} />
                  <main className="pt-4">
                    <OwnerDashboard
                      user={authUser}
                      managers={managers}
                      setManagers={setManagers}
                      employees={employees}
                      setEmployees={setEmployees}
                      workSettings={workSettings}
                      setWorkSettings={setWorkSettings}
                    />
                  </main>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/supervisor-dashboard"
            element={
              authUser ? (
                <>
                  <Header user={authUser} handleLogoutClick={handleLogoutClick} />
                  <main className="pt-4">
                    <SupervisorDashboard
                      user={authUser}
                      employees={employees}
                      setEmployees={setEmployees}
                      workSettings={workSettings}
                    />
                  </main>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;