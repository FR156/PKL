// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
    DUMMY_AUTH, 
    INITIAL_EMPLOYEES, 
    INITIAL_MANAGERS, 
    INITIAL_PENDING_LEAVE, 
    showSwal 
} from '../utils/constants';

export const useAuth = () => {
    const [authUser, setAuthUser] = useState(
        JSON.parse(localStorage.getItem('authUser'))
    );
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState(
        JSON.parse(localStorage.getItem('employees')) || INITIAL_EMPLOYEES
    );
    const [managers, setManagers] = useState(
        JSON.parse(localStorage.getItem('managers')) || INITIAL_MANAGERS
    );
    const [pendingLeave, setPendingLeave] = useState(
        JSON.parse(localStorage.getItem('pendingLeave')) || INITIAL_PENDING_LEAVE
    );
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('authUser', JSON.stringify(authUser));
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('managers', JSON.stringify(managers));
        localStorage.setItem('pendingLeave', JSON.stringify(pendingLeave));
    }, [authUser, employees, managers, pendingLeave]);

    // --- Update handleLogin jadi dinamis ---
    const handleLogin = (username, password) => {
        setIsLoading(true);

        setTimeout(() => {
            let foundUser = null;

            for (const key in DUMMY_AUTH) {
                const user = DUMMY_AUTH[key];
                if (user.username === username && user.password === password) {
                    foundUser = user;
                    break;
                }
            }

            if (foundUser) {
                setAuthUser(foundUser);
                showSwal('Login Berhasil!', `Selamat datang, ${foundUser.name} (${foundUser.role})!`, 'success', 2000);
            } else {
                showSwal('Login Gagal', 'Username atau password salah.', 'error');
            }

            setIsLoading(false);
        }, 1000);
    };

    const handleLogout = () => {
        localStorage.removeItem('authUser');
        setAuthUser(null);
        setIsLogoutModalOpen(false);
        showSwal('Logout Sukses', 'Anda telah berhasil keluar.', 'success', 1500);
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    return {
        authUser,
        setAuthUser,
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
    };
};
