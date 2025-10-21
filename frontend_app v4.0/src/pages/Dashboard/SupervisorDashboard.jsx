// src/pages/dashboard/SupervisorDashboard.jsx

import React, { useState, useMemo } from 'react';
import { TabButton } from '../../components/Shared/Modals/componentsUtilityUI.jsx';

// Import SEMUA Komponen Supervisor (Path: ../../components/)
import SupervisorSummary from '../../components/Summary/SupervisorSummary.jsx';
import SupervisorTaskApproval from '../../components/Approvals/SupervisorTaskApproval.jsx';
import SupervisorAttendanceApproval from '../../components/Approvals/SupervisorAttendanceApproval.jsx';
import SupervisorPerformanceReport from '../../components/Reporting/SupervisorPerformanceReport.jsx';
import SupervisorAttendance from '../../components/Absensi/SupervisorAttendance.jsx';
import SupervisorProfile from '../../components/Profiles/SupervisorProfile.jsx';

const SupervisorDashboard = (props) => {
    // Inisialisasi tab berdasarkan peran Supervisor
    const [activeTab, setActiveTab] = useState('summary');
    
    // Destrukturisasi props (termasuk state baru dari useAuth)
    const { 
        user, 
        employees, 
        setEmployees,
        workSettings, 
        setAuthUser,
        pendingTasks,
        setPendingTasks,
        pendingAttendance,
        setPendingAttendance,
        pendingProfileChanges,
        setPendingProfileChanges
    } = props;

    // Pastikan workSettings aman
    const safeWorkSettings = useMemo(() => workSettings || {}, [workSettings]);


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Dashboard */}
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
                <i className="fas fa-chalkboard-teacher mr-3 text-purple-600"></i> Dashboard Supervisor
            </h1>

            {/* Navigasi Tab */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b-2 pb-2 overflow-x-auto whitespace-nowrap">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-chart-pie mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'taskApproval'} onClick={() => setActiveTab('taskApproval')}>
                    <i className="fas fa-tasks mr-2"></i> Persetujuan Tugas ({pendingTasks?.length || 0})
                </TabButton>
                <TabButton isActive={activeTab === 'attendanceApproval'} onClick={() => setActiveTab('attendanceApproval')}>
                    <i className="fas fa-user-check mr-2"></i> Persetujuan Absensi ({pendingAttendance?.length || 0})
                </TabButton>
                <TabButton isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                    <i className="fas fa-chart-line mr-2"></i> Performa Tim
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
                {activeTab === 'summary' && 
                    <SupervisorSummary 
                        employees={employees} 
                        pendingTasks={pendingTasks}
                        pendingAttendance={pendingAttendance}
                    />
                }
                
                {/* 2. Persetujuan Tugas */}
                {activeTab === 'taskApproval' && 
                    <SupervisorTaskApproval 
                        employees={employees}
                        setEmployees={setEmployees}
                        pendingTasks={pendingTasks}
                        setPendingTasks={setPendingTasks} 
                    />
                }
                
                {/* 3. Persetujuan Absensi */}
                {activeTab === 'attendanceApproval' && 
                    <SupervisorAttendanceApproval 
                        employees={employees}
                        setEmployees={setEmployees}
                        pendingAttendance={pendingAttendance}
                        setPendingAttendance={setPendingAttendance}
                    />
                }
                
                {/* 4. Penilaian Performa */}
                {activeTab === 'performance' && 
                    <SupervisorPerformanceReport 
                        employees={employees}
                        setEmployees={setEmployees} 
                    />
                }
                
                {/* 5. Absensi Saya */}
                {activeTab === 'attendance' && (
                    <SupervisorAttendance 
                        user={user}
                        employees={employees}
                        setEmployees={setEmployees}
                        workSettings={safeWorkSettings}
                    />
                )}
                
                {/* 6. Profil Supervisor */}
                {activeTab === 'profile' && (
                    <SupervisorProfile 
                        user={user} 
                        employees={employees} 
                        setEmployees={setEmployees}
                        setAuthUser={setAuthUser}
                        pendingProfileChanges={pendingProfileChanges}
                        setPendingProfileChanges={setPendingProfileChanges}
                    />
                )}
            </div>
        </div>
    );
};

export default SupervisorDashboard;