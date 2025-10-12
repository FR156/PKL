// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.js'; 

import Header from './components/Header.jsx'; 
import LogoutModal from './components/LogoutModal.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EmployeeDashboard from './containers/EmployeeDashboard/EmployeeDashboard.jsx';
import ManagerDashboard from './containers/ManagerDashboard/ManagerDashboard.jsx';
import OwnerDashboard from './containers/OwnerDashboard/OwnerDashboard.jsx';
import SupervisorDashboard from './containers/SupervisorDashboard/SupervisorDashboard.jsx'; // pastikan import ini

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

  const [pendingProfileChanges, setPendingProfileChanges] = useState([]);

  useEffect(() => {
    if (workSettings) {
      localStorage.setItem("workSettings", JSON.stringify(workSettings));
    }
  }, [workSettings]);

  return (
    <div className="min-h-screen bg-gray-50 smooth-transition">
      {!authUser ? (
        // --- LOGIN PAGE ---
        <LoginPage handleLogin={handleLogin} isLoading={isLoading} />
      ) : (
        <>
          <Header user={authUser} handleLogoutClick={handleLogoutClick} />
          <main className="container mx-auto p-4 md:p-8">
            {authUser.role === "employee" && (
              <EmployeeDashboard
                user={authUser}
                employees={employees}
                setEmployees={setEmployees}
                setPendingLeave={setPendingLeave}
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
              />
            )}

            {authUser.role === "owner" && (
              <OwnerDashboard
                user={authUser}
                managers={managers}
                setManagers={setManagers}
                employees={employees}
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
