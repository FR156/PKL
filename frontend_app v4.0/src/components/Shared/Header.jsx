
import React from 'react';
import { COLORS } from '../../utils/constants';


const Header = ({ user, handleLogoutClick }) => {
    if (!user) {
        return (
            /* PERBAIKAN: pt-4, bg-transparent, mx-4 md:mx-8 */
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-4 bg-transparent mx-4 md:mx-8">
                <header className="bg-white/30 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/20 rounded-full px-8 py-4 max-w-4xl w-full">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-xl rounded-full p-3 mr-4 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)] border border-white/30">
                                <i className="fas fa-building text-white text-xl"></i>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800/90 tracking-tight">HRMS System</h1>
                        </div>
                    </div>
                </header>
            </div>
        );
    }

    const roleText = user?.role?.toUpperCase() || "UNKNOWN";

    return (
        /* PERBAIKAN: pt-4, bg-[#D3DFFE], mx-4 md:mx-8 */
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-4 bg-[#D3DFFE] mx-4 md:mx-8">
            <header className="bg-white/30 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/20 rounded-full px-6 sm:px-8 py-4 max-w-4xl w-full transition-all duration-300">
                <div className="flex justify-between items-center">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <h1 className="text-xl font-bold text-gray-800/90 tracking-tight">
                                HRMS
                            </h1>
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-400/30 to-blue-600/30 backdrop-blur-xl text-blue-700/90 border border-white/40 shadow-sm mt-2 sm:mt-0 transition-all duration-200 hover:shadow-md`}>
                                {roleText}
                            </span>
                        </div>
                    </div>

                    {/* Right: Profile & Logout */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Profile (desktop) */}
                        <div className="hidden sm:flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800/90">{user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-600/80 capitalize">
                                    {user?.role === 'employee'
                                        ? (user?.division || 'Employee')
                                        : user?.role === 'manager'
                                        ? 'Manager'
                                        : user?.role === 'owner'
                                        ? 'Owner'
                                        : 'User'}
                                </p>
                            </div>
                            <div className="relative">
                                <img
                                    src={user?.profileImage || 'https://picsum.photos/seed/employee/40/40.jpg'}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/80"></div>
                            </div>
                        </div>

                        {/* Profile (mobile) */}
                        <div className="sm:hidden relative">
                            <img
                                src={user?.profileImage || 'https://picsum.photos/seed/employee/36/36.jpg'}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover border-2 border-white/50 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]"
                            />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/80"></div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center bg-red-500 text-white text-sm font-medium py-2.5 px-4 rounded-full 
                                   focus:outline-none focus:ring-0 active:outline-none" // <-- Perubahan ada di sini
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt mr-2"></i>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;

