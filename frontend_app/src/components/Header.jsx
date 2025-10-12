// src/components/Header.jsx
import React from 'react';
import { COLORS } from '../utils/constants'; // Import COLORS

const Header = ({ user, handleLogoutClick }) => {
    // Kalau user belum ada, tampilkan loading state
    if (!user) {
        return (
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <i className="fas fa-building text-blue-600 text-2xl mr-2"></i>
                        <h1 className="text-xl font-bold text-gray-800">HRIS System (Loading...)</h1>
                    </div>
                </div>
            </header>
        );
    }

    // Pastikan role uppercase aman
    const roleText = user?.role?.toUpperCase() || "UNKNOWN";

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                {/* Kiri: Logo + Judul */}
                <div className="flex items-center">
                    <i className="fas fa-building text-blue-600 text-2xl mr-2"></i>
                    <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                        HRIS System (Role: {roleText})
                    </h1>
                    <h1 className="text-xl font-bold text-gray-800 sm:hidden">
                        HRIS ({roleText})
                    </h1>
                </div>

                {/* Kanan: Profile + Logout */}
                <div className="flex items-center space-x-4">
                    {/* Profile (desktop) */}
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center">
                            <img
                                src={user?.profileImage || 'https://picsum.photos/seed/employee/40/40.jpg'}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                                <p className="font-semibold text-gray-800">{user?.name || "No Name"}</p>
                                <p
                                    className="text-xs font-medium"
                                    style={{ color: COLORS.Secondary }}
                                >
                                    {user?.role === 'employee'
                                        ? (user?.division || 'Karyawan')
                                        : user?.role === 'manager'
                                        ? 'Manajer'
                                        : user?.role === 'owner'
                                        ? 'Owner'
                                        : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile (mobile) */}
                    <div className="sm:hidden">
                        <img
                            src={user?.profileImage || 'https://picsum.photos/seed/employee/40/40.jpg'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>

                    {/* Tombol Logout */}
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-lg smooth-transition"
                        title="Logout"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
