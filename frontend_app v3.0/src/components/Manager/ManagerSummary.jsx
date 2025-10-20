// src/components/Manager/ManagerSummary.jsx
import React from 'react';
// Sesuaikan path import komponen UI berdasarkan struktur baru Anda
import { GlassCard, StatCard } from '../UI/Cards'; 
import { COLORS } from '../../utils/constants'; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'; // Import dari recharts

// --- B1. Ringkasan Dashboard Manager ---
const ManagerSummary = ({ employees, pendingLeave, user }) => {
    // Pindahkan semua state, ref, dan handler dari fungsi ManagerSummary di ManagerDashboard.jsx ke sini.
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    
    // Hitung karyawan yang terlambat hari ini (Simulasi)
    const today = new Date().toLocaleDateString('id-ID'); // Format tanggal yang sama dengan data dummy
    const lateToday = employees.flatMap(e => e.currentMonthAttendance)
        .filter(a => a.type === 'Clock In' && a.late && a.date === today).length;

    const pendingLeaveCount = pendingLeave.length;

    // Data chart (Simulasi kehadiran bulan ini)
    const attendanceSummary = employees.flatMap(e => e.currentMonthAttendance)
        .filter(a => a.type === 'Clock In');

    const totalDaysIn = attendanceSummary.length;
    const totalLate = attendanceSummary.filter(a => a.late).length;
    const totalOnTime = totalDaysIn - totalLate;
    
    const chartData = [
        { name: 'Tepat Waktu', value: totalOnTime, color: COLORS.Success },
        { name: 'Terlambat', value: totalLate, color: COLORS.Error },
        { name: 'Cuti Pending', value: pendingLeaveCount, color: COLORS.Warning },
    ];
    
    // Filter data chart yang valuenya > 0
    const filteredChartData = chartData.filter(item => item.value > 0);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-chart-pie mr-3 text-blue-600"></i> Ringkasan Kinerja Tim
            </h2>

            {/* Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Karyawan" value={totalEmployees} icon="fas fa-users" color="blue" />
                <StatCard title="Karyawan Aktif" value={activeEmployees} icon="fas fa-user-check" color="green" />
                <StatCard title="Terlambat Hari Ini" value={lateToday} icon="fas fa-hourglass-end" color="red" />
                <StatCard title="Cuti Pending" value={pendingLeaveCount} icon="fas fa-plane-departure" color="yellow" />
            </div>

            {/* Chart Kehadiran */}
            <GlassCard className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700">Kehadiran Tim Bulan Ini</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={filteredChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {filteredChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    {totalDaysIn === 0 && (
                        <p className="text-center text-gray-500 mt-4">Belum ada data absensi bulan ini.</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default ManagerSummary;