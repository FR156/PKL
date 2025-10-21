// src/pages/Dashboard/OwnerDashboard/OwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { TabButton } from "../../../components/Shared/Modals/componentsUtilityUI.jsx";
import { showSwal } from '../../../utils/swal.js';

// ✨ Import SEMUA Sub-Komponen dari folder yang SAMA (OwnerDashboard/)
import OwnerSummary from './OwnerSummary.jsx'; 
import OwnerEmployeeManagement from './OwnerEmployeeManagement.jsx';
import OwnerManagerManagement from './OwnerManagerManagement.jsx';
import OwnerSupervisorManagement from './OwnerSupervisorManagement.jsx';
import OwnerMonthlyTarget from './OwnerMonthlyTarget.jsx';
import OwnerEmployeePerformance from './OwnerEmployeePerformance.jsx';
import OwnerPayrollReport from './OwnerPayrollReport.jsx';
import OwnerAttendanceDetailReport from './OwnerAttendanceDetailReport.jsx';
import OwnerAttendanceReport from './OwnerAttendanceReport.jsx';
import OwnerWorkSettings from './OwnerWorkSettings.jsx';

// Data dummy lokal untuk Supervisor (untuk bootstrapping)
const INITIAL_SUPERVISORS = [
    {
        id: 401,
        username: 'supervisor',
        password: 'password',
        name: 'Sari Supervisor',
        role: 'supervisor',
        email: 'sari.supervisor@company.com',
        phone: '08111222333',
        division: 'Tech',
        status: 'Active',
        joinDate: '2023-01-15',
        subordinates: [101, 102],
        profileImage: 'https://picsum.photos/seed/supervisor/100/100.jpg',
        loginHistory: [],
        salaryDetails: { basic: 7000000, allowance: 1500000, overtimeHours: 0, overtimeRate: 60000, bonus: 0, deductions: 0 },
    },
];


const OwnerDashboard = (props) => {
    // Memecah props dari App.jsx
    const { user, managers, setManagers, employees, setEmployees, workSettings, setWorkSettings } = props;
    const [activeTab, setActiveTab] = useState('summary');
    
    // State lokal untuk Supervisor
    const [supervisors, setSupervisors] = useState(() => {
        const saved = localStorage.getItem('supervisors');
        return saved ? JSON.parse(saved) : INITIAL_SUPERVISORS;
    });

    // Sync state supervisors ke localStorage
    useEffect(() => {
        localStorage.setItem('supervisors', JSON.stringify(supervisors));
    }, [supervisors]);

    // Gabungkan semua props yang diperlukan untuk sub-komponen
    const allProps = { 
        user,
        managers, 
        setManagers, 
        employees, 
        setEmployees, 
        workSettings, 
        setWorkSettings,
        supervisors, 
        setSupervisors 
    };

    return (
        <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Halo, {user.name} ({user.role.toUpperCase()})</h1>
            <p className="text-gray-600">Panel Owner: Kontrol penuh atas manajemen HRIS perusahaan Anda.</p>

            {/* Navigasi Tab */}
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 border-b border-gray-200">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-chart-bar mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'emp'} onClick={() => setActiveTab('emp')}>
                    <i className="fas fa-users mr-2"></i> Karyawan
                </TabButton>
                <TabButton isActive={activeTab === 'manager'} onClick={() => setActiveTab('manager')}>
                    <i className="fas fa-user-tie mr-2"></i> Manager
                </TabButton>
                <TabButton isActive={activeTab === 'supervisor'} onClick={() => setActiveTab('supervisor')}>
                    <i className="fas fa-user-shield mr-2"></i> Supervisor
                </TabButton>
                <TabButton isActive={activeTab === 'target'} onClick={() => setActiveTab('target')}>
                    <i className="fas fa-crosshairs mr-2"></i> Target
                </TabButton>
                <TabButton isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                    <i className="fas fa-chart-line mr-2"></i> Performa
                </TabButton>
                <TabButton isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')}>
                    <i className="fas fa-file-invoice-dollar mr-2"></i> Gaji
                </TabButton>
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-list-alt mr-2"></i> Absensi Detail
                </TabButton>
                <TabButton isActive={activeTab === 'report'} onClick={() => setActiveTab('report')}>
                    <i className="fas fa-camera-retro mr-2"></i> Absensi Foto
                </TabButton>
                <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                    <i className="fas fa-cog mr-2"></i> Pengaturan
                </TabButton>
            </div>

            {/* Content Rendering */}
            {activeTab === 'summary' && <OwnerSummary {...allProps} />}
            {activeTab === 'emp' && <OwnerEmployeeManagement {...allProps} />}
            {activeTab === 'manager' && <OwnerManagerManagement {...allProps} />}
            {activeTab === 'supervisor' && <OwnerSupervisorManagement {...allProps} />}
            {activeTab === 'target' && <OwnerMonthlyTarget {...allProps} />}
            {activeTab === 'performance' && <OwnerEmployeePerformance {...allProps} />}
            {activeTab === 'payroll' && <OwnerPayrollReport {...allProps} />}
            {activeTab === 'attendance' && <OwnerAttendanceDetailReport {...allProps} />}
            {activeTab === 'report' && <OwnerAttendanceReport {...allProps} />}
            {activeTab === 'settings' && <OwnerWorkSettings {...allProps} />}
        </div>
    );
};

export default OwnerDashboard;