// src/pages/Dashboard/OwnerDashboard/OwnerEmployeePerformance.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard, PrimaryButton } from '../../../components/Shared/Modals/componentsUtilityUI';
import { showSwal } from '../../../utils/swal';

// --- LOGIKA UTAMA: Perhitungan Skor Performa ---
const calculatePerformanceScore = (employee) => {
    // --- 1. Data Absensi (Kontribusi 40%) ---
    const attendanceRecords = employee.currentMonthAttendance || [];
    const totalClockIns = attendanceRecords.filter(a => a.type === 'Clock In').length;
    const totalLate = attendanceRecords.filter(a => a.type === 'Clock In' && a.late).length;
    const totalEarlyLeave = attendanceRecords.filter(a => a.type === 'Clock Out' && a.earlyLeave).length;
    
    // Hari kerja diasumsikan 22 hari
    const assumedWorkingDays = 22; 
    
    // Poin Absensi (Maks 40)
    // Formula: (Total Kehadiran / Max Hari Kerja) * 40 - (Total Keterlambatan * 1.5) - (Total Pulang Cepat * 2.0)
    let attendanceScore = (totalClockIns / assumedWorkingDays) * 40;
    attendanceScore -= totalLate * 1.5;
    attendanceScore -= totalEarlyLeave * 2.0;

    // --- 2. Data Target (Kontribusi 30%) ---
    // Gunakan target dan realisasi (realisasi akan di-dummy)
    const currentMonth = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    const target = employee.targets?.find(t => t.month === currentMonth)?.value || 0;
    
    let targetAchievement = 0;
    if (target > 0) {
        // Realisasi Dummy (misal: 80% - 120% dari target)
        const realisasi = Math.round(target * (0.8 + Math.random() * 0.4));
        targetAchievement = realisasi / target;
    } else {
        // Jika tidak ada target, berikan nilai tengah (100% achievement)
        targetAchievement = 1.0;
    }

    // Poin Target (Maks 30)
    let targetScore = Math.min(targetAchievement, 1.2) * 30; // Batasi max score di 120%

    // --- 3. Data Kedisiplinan/Lain-lain (Kontribusi 30%) ---
    // Nilai acak antara 20 - 30 untuk simulasi penilaian atasan, cuti, dll.
    const disciplinaryScore = 20 + Math.random() * 10; 

    // --- Total Skor (Maks 100) ---
    const rawScore = Math.max(0, attendanceScore) + Math.max(0, targetScore) + disciplinaryScore;
    const finalScore = Math.round(Math.min(100, rawScore));
    
    // Kategorisasi
    const category = finalScore >= 90 ? 'Sangat Baik' :
                     finalScore >= 80 ? 'Baik' :
                     finalScore >= 65 ? 'Cukup' :
                     'Perlu Perbaikan';

    return {
        score: finalScore,
        category,
        details: {
            attendanceScore: Math.round(Math.max(0, attendanceScore)),
            targetScore: Math.round(Math.max(0, targetScore)),
            disciplinaryScore: Math.round(disciplinaryScore),
            target,
            realisasi: target > 0 ? Math.round(target * (0.8 + Math.random() * 0.4)) : 'N/A'
        }
    };
};
// --- END LOGIKA UTAMA ---


const OwnerEmployeePerformance = ({ employees }) => {
    const [filterDivision, setFilterDivision] = useState('All');
    const uniqueDivisions = ['All', ...new Set(employees.map(e => e.division))];

    // Gunakan useMemo agar perhitungan hanya dilakukan saat employees atau filter berubah
    const performanceData = useMemo(() => {
        return employees.map(emp => ({
            ...emp,
            performance: calculatePerformanceScore(emp)
        }))
        .filter(emp => filterDivision === 'All' || emp.division === filterDivision)
        .sort((a, b) => b.performance.score - a.performance.score); // Urutkan dari skor tertinggi
    }, [employees, filterDivision]);
    
    const getBadgeColor = (category) => {
        switch (category) {
            case 'Sangat Baik': return 'bg-green-500';
            case 'Baik': return 'bg-blue-500';
            case 'Cukup': return 'bg-yellow-500';
            case 'Perlu Perbaikan': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const handleShowDetails = (employee) => {
        const p = employee.performance;
        showSwal(
            `Detail Performa ${employee.name}`,
            `<div class="text-left space-y-2 text-gray-700">
                <p><strong>Skor Akhir:</strong> <span class="text-xl font-bold ${getBadgeColor(p.category).replace('bg', 'text')}">${p.score} (${p.category})</span></p>
                <p><strong>Target Bulan Ini:</strong> ${p.details.target > 0 ? p.details.target : 'Tidak Ditetapkan'}</p>
                <p><strong>Realisasi:</strong> ${p.details.realisasi}</p>
                <hr class="my-2"/>
                <p><strong>Skor Absensi (40%):</strong> ${p.details.attendanceScore}</p>
                <p><strong>Skor Target (30%):</strong> ${p.details.targetScore}</p>
                <p><strong>Skor Lain-lain (30%):</strong> ${p.details.disciplinaryScore}</p>
            </div>`,
            'info',
            0 // Tidak otomatis tertutup
        );
    };


    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laporan Performa Karyawan</h2>
            <h3 className="text-xl font-semibold text-gray-700">Bulan: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>

            <div className="flex justify-start mb-4">
                <label htmlFor="division-filter" className="text-sm font-medium text-gray-700 mr-2 self-center">Filter Divisi:</label>
                <select 
                    id="division-filter"
                    value={filterDivision}
                    onChange={(e) => setFilterDivision(e.target.value)}
                    className="p-2 border rounded"
                >
                    {uniqueDivisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                    ))}
                </select>
            </div>
            
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-purple-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Skor Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {performanceData.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.division}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">{e.performance.score}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getBadgeColor(e.performance.category)}`}>
                                        {e.performance.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <PrimaryButton onClick={() => handleShowDetails(e)} className="bg-indigo-500 hover:bg-indigo-600 p-2 text-sm">
                                        <i className="fas fa-info-circle"></i> Detail
                                    </PrimaryButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

export default OwnerEmployeePerformance;