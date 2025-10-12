// src/components/LogoutModal.jsx
import React, { useEffect } from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    // Close modal on Escape key press
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            {/* Modal container with glassmorphism effect */}
            <div 
                className="relative w-full max-w-md transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Modal content */}
                    <div className="px-8 pt-8 pb-6">
                        <div className="text-center">
                            {/* Icon container with glassmorphism effect */}
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-sm border border-red-200/30 shadow-lg">
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            
                            {/* Text content with better typography */}
                            <h3 className="mt-6 text-2xl font-bold text-gray-900" id="modal-title">
                                Konfirmasi Logout
                            </h3>
                            <div className="mt-3">
                                <p className="text-base text-gray-600">
                                    Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action buttons with centered layout */}
                    <div className="px-8 pb-8 space-y-3">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center items-center rounded-2xl bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                            onClick={onConfirm}
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Ya, Logout
                        </button>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center items-center rounded-2xl bg-white/60 backdrop-blur-sm px-6 py-3 text-base font-semibold text-gray-700 shadow-md border border-white/50 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                            onClick={onClose}
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;