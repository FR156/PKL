// src/containers/ManagerDashboard/ManagerDashboard.jsx

import React, { useState, useMemo } from 'react';
import { TabButton } from '../../components/Shared/Modals/componentsUtilityUI.jsx'; // Import UI yang benar

// Import SEMUA Komponen Manager dari lokasi yang sudah kita pecah (.jsx ditambahkan)
import ManagerSummary from '../../components/Manager/ManagerSummary.jsx';
import ManagerEmployeeManagement from '../../components/Manager/ManagerEmployeeManagement.jsx';
import ManagerLeaveApproval from '../../components/Approvals/ManagerLeaveApproval.jsx';
import ManagerProfileApproval from '../../components/Approvals/ManagerProfileApproval.jsx';
import ManagerPayrollReport from '../../components/Reporting/ManagerPayrollReport.jsx';
import ManagerAttendanceReport from '../../components/Reporting/ManagerAttendanceReport.jsx';
import ManagerAttendance from '../../components/Absensi/ManagerAttendance.jsx'; // Absensi Saya
import ManagerProfile from '../../components/Profiles/ManagerProfile.jsx'; // Profil Saya

const ManagerDashboard = (props) => {
    // Inisialisasi tab berdasarkan peran Manajer
    const [activeTab, setActiveTab] = useState('summary');
    
    // Destrukturisasi props untuk kemudahan penggunaan
    const { 
        user, 
        employees, 
        workSettings, 
        pendingProfileChanges,
        setPendingProfileChanges, 
        setAuthUser 
    } = props;

    // Pastikan workSettings aman
    const safeWorkSettings = useMemo(() => workSettings || {}, [workSettings]);


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Dashboard */}
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
                <i className="fas fa-tachometer-alt mr-3 text-blue-600"></i> Dashboard Manajer
            </h1>

            {/* Navigasi Tab */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b-2 pb-2 overflow-x-auto whitespace-nowrap">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-chart-pie mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'emp'} onClick={() => setActiveTab('emp')}>
                    <i className="fas fa-users-cog mr-2"></i> Kelola Tim
                </TabButton>
                <TabButton isActive={activeTab === 'approval'} onClick={() => setActiveTab('approval')}>
                    <i className="fas fa-plane-departure mr-2"></i> Persetujuan Cuti
                </TabButton>
                 <TabButton isActive={activeTab === 'profileApproval'} onClick={() => setActiveTab('profileApproval')}>
                    <i className="fas fa-user-check mr-2"></i> Persetujuan Profil
                </TabButton>
                <TabButton isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')}>
                    <i className="fas fa-file-invoice-dollar mr-2"></i> Laporan Gaji
                </TabButton>
                <TabButton isActive={activeTab === 'report'} onClick={() => setActiveTab('report')}>
                    <i className="fas fa-camera mr-2"></i> Laporan Selfie
                </TabButton>
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-clock mr-2"></i> Absensi Saya
                </TabButton>
                <TabButton isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <i className="fas fa-user mr-2"></i> Profil
                </TabButton>
            </div>

            {/* Content Berdasarkan Tab Aktif */}
            <div className="min-h-[60vh]">
                {/* 1. Ringkasan */}
                {activeTab === 'summary' && <ManagerSummary {...props} />}
                
                {/* 2. Kelola Karyawan */}
                {activeTab === 'emp' && <ManagerEmployeeManagement {...props} />}
                
                {/* 3. Persetujuan Cuti */}
                {activeTab === 'approval' && <ManagerLeaveApproval {...props} />}
                
                {/* 4. Persetujuan Perubahan Profil */}
                {activeTab === 'profileApproval' && (
                    <ManagerProfileApproval
                        {...props}
                        pendingProfileChanges={pendingProfileChanges}
                        setPendingProfileChanges={setPendingProfileChanges}
                        setAuthUser={setAuthUser}
                    />
                )}
                
                {/* 5. Laporan Gaji */}
                {activeTab === 'payroll' && <ManagerPayrollReport {...props} />}
                
                {/* 6. Laporan Absensi Selfie */}
                {activeTab === 'report' && <ManagerAttendanceReport {...props} />}
                
                {/* 7. Absensi Saya (Absensi/Clock In/Out) */}
                {activeTab === 'attendance' && (
                    <ManagerAttendance 
                        user={user}
                        employees={employees}
                        setEmployees={props.setEmployees}
                        workSettings={safeWorkSettings}
                    />
                )}
                
                {/* 8. Profil Manajer */}
                {activeTab === 'profile' && (
                    <ManagerProfile 
                        {...props} 
                        setAuthUser={setAuthUser}
                        pendingProfileChanges={pendingProfileChanges}
                        setPendingProfileChanges={setPendingProfileChanges}
                    />
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;