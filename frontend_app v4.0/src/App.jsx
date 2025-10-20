// src/App.jsx (Kode Lengkap)
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.js'; // PATH BARU
import Header from './components/Shared/Header.jsx'; // PATH BARU
import LogoutModal from './components/Shared/Modals/LogoutModal.jsx'; // PATH BARU
import LoginPage from './pages/LoginPage.jsx'; // PATH BARU
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard.jsx'; // PATH BARU
import ManagerDashboard from './pages/Dashboard/ManagerDashboard.jsx'; // PATH BARU
import OwnerDashboard from './pages/Dashboard/OwnerDashboard/OwnerDashboard.jsx';
import SupervisorDashboard from './pages/Dashboard/SupervisorDashboard.jsx'; // PATH BARU
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


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
    setAuthUser
  } = useAuth();

  const [workSettings, setWorkSettings] = useState(() => {
    const saved = localStorage.getItem("workSettings");
    return saved
      ? JSON.parse(saved)
      : { startTime: "08:00", endTime: "17:00", lateDeduction: 50000, earlyLeaveDeduction: 75000 };
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
    localStorage.setItem("pendingProfileChanges", JSON.stringify(pendingProfileChanges));
  }, [pendingProfileChanges]);


 return (
    <div className="min-h-screen bg-gray-50">
        {isLoading && (
            // Menggunakan backdrop-blur untuk tampilan yang lebih modern
            <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
                {/* Wrapper untuk Lottie dan teks loading.
                    Hapus styling background putih dan border-nya.
                    Tambahkan flex-col dan items-center untuk centering vertikal dan horizontal.
                */}
                <div className="flex flex-col items-center justify-center"> 
                    
                    {/* EMBED LOTTIE KUSTOM */}
                    {/* Perbesar ukuran menjadi h-48 w-48 (sekitar 192px x 192px) */}
                    <div className="h-48 w-48 mb-4"> {/* Ukuran disesuaikan jadi lebih besar */}
                        <DotLottieReact
                            src="https://lottie.host/9581a0e7-e2e2-4ac9-afbd-7d4cface4c28/O3EfZ0vhqK.lottie"
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
      {!authUser ? (
        <LoginPage handleLogin={handleLogin} isLoading={isLoading} />
      ) : (
        <>
          <Header user={authUser} handleLogoutClick={handleLogoutClick} />
          <main className="pt-4 ">
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
                setEmployees={setEmployees} // Tambahkan ini
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
      )}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default App;