// src/pages/Dashboard/OwnerDashboard/OwnerSummary.jsx
import React from 'react';
import { GlassCard, StatCard } from '../../../components/Shared/Modals/componentsUtilityUI';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
import {  COLORS } from '../../../utils/constants';
import { formattedCurrency } from '../../../utils/formatters'; // Utilitas dari constants.js
import { calculateTotalSalary } from '../../../utils/formatters'; // Fungsi utilitas untuk menghitung total gaji

const OwnerSummary = ({ managers, employees, supervisors }) => {
    // --- Data Karyawan ---
    const allPersonnel = [...managers, ...employees, ...supervisors];
    const totalPersonnel = allPersonnel.length;
    const activePersonnel = allPersonnel.filter(p => p.status === 'Active').length;

    // --- Statistik Absensi (Dummy/Sederhana) ---
    const totalAttendanceRecords = allPersonnel.flatMap(p => p.currentMonthAttendance).length;
    const totalLates = allPersonnel.flatMap(p => p.currentMonthAttendance)
        .filter(a => a.type === 'Clock In' && a.late).length;

    // --- Statistik Divisi ---
    const divisionData = allPersonnel.reduce((acc, person) => {
        const division = person.division || 'Unassigned';
        acc[division] = (acc[division] || 0) + 1;
        return acc;
    }, {});
    
    const pieChartData = Object.keys(divisionData).map((name, index) => ({
        name: name,
        value: divisionData[name],
        color: COLORS[`Chart${(index % 5) + 1}`] || COLORS.Primary, // Asumsi ada 5 warna Chart
    }));

    // --- Statistik Gaji ---
    const totalMonthlySalary = allPersonnel.reduce((sum, person) => {
        return sum + (calculateTotalSalary(person.salaryDetails) || 0);
    }, 0);
    const averageSalary = totalPersonnel > 0 ? totalMonthlySalary / totalPersonnel : 0;


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Ringkasan Owner Dashboard</h2>

            {/* BARIS 1: STATS UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Personil" value={totalPersonnel} icon="fas fa-users" color="blue" />
                <StatCard title="Personil Aktif" value={activePersonnel} icon="fas fa-user-check" color="green" />
                <StatCard title="Total Absensi Bulan Ini" value={totalAttendanceRecords} icon="fas fa-calendar-check" color="purple" />
            </div>

            {/* BARIS 2: STATS KEUANGAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Gaji Bulanan" value={formattedCurrency(totalMonthlySalary)} icon="fas fa-money-bill-wave" color="indigo" isCurrency={true} />
                <StatCard title="Rata-rata Gaji Per Personil" value={formattedCurrency(averageSalary)} icon="fas fa-wallet" color="pink" isCurrency={true} />
                <StatCard title="Total Keterlambatan" value={totalLates} icon="fas fa-hourglass-end" color="red" />
            </div>

            {/* BARIS 3: GRAFIK */}
            <GlassCard className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribusi Role</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <StatCard title="Karyawan" value={employees.length} icon="fas fa-user-tie" color="blue" />
                        <StatCard title="Supervisor" value={supervisors.length} icon="fas fa-user-shield" color="yellow" />
                        <StatCard title="Manager" value={managers.length} icon="fas fa-crown" color="green" />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribusi Personil per Divisi</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} Personil`} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
};

export default OwnerSummary;