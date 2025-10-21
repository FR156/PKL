import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore'; // Impor useAuthStore
import { 
    DUMMY_AUTH, 
    INITIAL_EMPLOYEES, 
    INITIAL_MANAGERS, 
    INITIAL_PENDING_LEAVE,
} from '../utils/constants'; 
import { showSwal } from '../utils/swal';

// Helper function untuk lazy initialization state
const getInitialState = (key, initialData) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialData;
};

export const useAuth = () => {
    // Ambil state dari useAuthStore
    const { user: authUser, logout: logoutFromStore } = useAuthStore();

    // Gunakan state dari useAuthStore sebagai authUser
    const [localAuthUser, setLocalAuthUser] = useState(authUser);
    const [isLoading, setIsLoading] = useState(false);

    const [employees, setEmployees] = useState(() => getInitialState('employees', INITIAL_EMPLOYEES));
    const [managers, setManagers] = useState(() => getInitialState('managers', INITIAL_MANAGERS));
    const [pendingLeave, setPendingLeave] = useState(() => getInitialState('pendingLeave', INITIAL_PENDING_LEAVE));
    
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Sinkronkan local state dengan store
    useEffect(() => {
        setLocalAuthUser(authUser);
    }, [authUser]);

    // Sync state ke localStorage (hanya untuk data non-auth)
    useEffect(() => {
        // Jangan simpan authUser ke localStorage di sini karena sudah dihandle oleh zustand persist
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('managers', JSON.stringify(managers));
        localStorage.setItem('pendingLeave', JSON.stringify(pendingLeave));
    }, [employees, managers, pendingLeave]);

    // --- Update handleLogin untuk menggunakan authService ---
    const handleLogin = async (name, password) => { // Ganti parameter dari username/password ke name/password
        setIsLoading(true);

        try {
            // Panggil fungsi login dari authService
            // Fungsi login ini sekarang akan menyimpan data ke useAuthStore
            // Kita tidak perlu menangani hasilnya secara manual di sini karena useAuthStore sudah otomatis sinkron
            await import('../api/authService').then(module => module.login(name, password));
            
            // showSwal bisa dihapus atau diganti sesuai kebutuhan, karena login sekarang menggunakan authService
            // showSwal('Login Berhasil!', `Selamat datang, ${foundUser.name} (${foundUser.role.toUpperCase()})!`, 'success', 2000);
        } catch (error) {
            // showSwal('Login Gagal', error.message || 'Username atau password salah.', 'error');
            console.error("Login error:", error);
            throw error; // Lempar error agar bisa ditangani di LoginPage
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        // Panggil fungsi logout dari authService
        logoutFromStore();
        setIsLogoutModalOpen(false);
        // showSwal('Logout Sukses', 'Anda telah berhasil keluar.', 'success', 1500);
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    // Fungsi untuk memperbarui user jika diperlukan (misalnya dari API)
    const setAuthUser = (updatedUser) => {
        // Kita bisa mengupdate user di store jika diperlukan
        const currentStoreState = useAuthStore.getState();
        currentStoreState.setAuth({
            user: updatedUser,
            access_token: currentStoreState.access_token,
            refresh_token: currentStoreState.refresh_token,
        });
    };

    return {
        authUser: localAuthUser, // Kembalikan authUser dari store
        setAuthUser, // Fungsi untuk memperbarui user
        isLoading,
        employees,
        setEmployees,
        managers,
        setManagers,
        pendingLeave,
        setPendingLeave,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        handleLogin, // Gunakan handleLogin yang baru
        handleLogout,
        handleLogoutClick,
    };
};