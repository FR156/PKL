// src/components/Summary/SupervisorSummary.jsx
import React from 'react';
import { StatCard } from '../UI/Cards.jsx'; 

// --- D1. Ringkasan Dashboard Supervisor ---
const SupervisorSummary = ({ employees, pendingTasks, pendingAttendance }) => {
    // Diasumsikan employees yang dilewatkan ke SupervisorDashboard adalah anggota timnya saja.
    const totalTeam = employees.length;
    const activeTeam = employees.filter(e => e.status === 'Active').length;
    
    // Hitung absensi terlambat hari ini
    const today = new Date().toLocaleDateString('id-ID');
    const lateToday = employees.flatMap(e => e.currentMonthAttendance)
        .filter(a => a.type === 'Clock In' && a.late && a.date === today).length;
        
    // Jumlah tugas dan permintaan absensi yang harus disetujui
    const pendingTasksCount = pendingTasks?.length || 0;
    const pendingAttendanceCount = pendingAttendance?.length || 0;
    
    // Filter karyawan yang sedang cuti
    const onLeaveToday = employees.filter(e => 
        e.currentMonthAttendance.some(a => a.type === 'Cuti' && a.date === today)
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Total Anggota Tim" 
                value={totalTeam} 
                icon="fas fa-users" 
                color="blue" 
            />
            <StatCard 
                title="Tugas Pending" 
                value={pendingTasksCount} 
                icon="fas fa-tasks" 
                color="red" 
                detailText={`Ada ${pendingTasksCount} tugas menanti persetujuan.`}
            />
            <StatCard 
                title="Absensi Perlu Koreksi" 
                value={pendingAttendanceCount} 
                icon="fas fa-user-clock" 
                color="orange" 
                detailText={`${pendingAttendanceCount} permintaan koreksi absensi.`}
            />
            <StatCard 
                title="Terlambat Hari Ini" 
                value={lateToday} 
                icon="fas fa-user-times" 
                color="yellow" 
                detailText={`${onLeaveToday} anggota tim sedang cuti hari ini.`}
            />
        </div>
    );
};

export default SupervisorSummary;