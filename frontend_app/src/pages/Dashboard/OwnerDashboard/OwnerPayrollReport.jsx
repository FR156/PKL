// src/pages/Dashboard/OwnerDashboard/OwnerPayrollReport.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/Shared/Modals/componentsUtilityUI'; 
import { formattedCurrency } from '../../../utils/formatters'; // Hapus PrimaryButton, showSwal
// Hapus import yang tidak diperlukan karena ReportGenerator sudah mengurusnya
// import jsPDF from 'jspdf'; 
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// import { calculateTotalSalary } from '../../../utils/constants'; // Hapus karena tidak digunakan langsung

// ✨ Import komponen baru
import PayrollTable from '../../../components/Reporting/PayrollTable'; 
import ReportGenerator from '../../../components/Reporting/ReportGenerator'; 


// --- LOGIKA UTAMA: Generate Data Gaji (TETAP) ---
const generatePayrollData = (employees, workSettings) => {
    return employees.map(emp => {
        // Data Gaji
        const details = emp.salaryDetails || {};
        const basic = details.basic || 0;
        const allowance = details.allowance || 0;
        const overtimeHours = details.overtimeHours || 0;
        const overtimeRate = details.overtimeRate || 0;
        const bonus = details.bonus || 0;
        
        // Perhitungan Lembur
        const overtimePay = overtimeHours * overtimeRate;

        // Data Absensi
        const attendanceRecords = emp.currentMonthAttendance || [];
        const totalLate = attendanceRecords.filter(a => a.type === 'Clock In' && a.late).length;
        const totalEarlyLeave = attendanceRecords.filter(a => a.type === 'Clock Out' && a.earlyLeave).length;

        // Perhitungan Potongan
        const lateDeduction = (workSettings.lateDeduction || 0) * totalLate;
        const earlyLeaveDeduction = (workSettings.earlyLeaveDeduction || 0) * totalEarlyLeave;
        const deductionsOther = details.deductions || 0;
        const totalDeductions = deductionsOther + lateDeduction + earlyLeaveDeduction; // Potongan lain-lain + Potongan Absensi

        // Perhitungan Total
        const grossSalary = basic + allowance + overtimePay + bonus;
        const netSalary = grossSalary - totalDeductions;

        return {
            id: emp.id,
            name: emp.name,
            role: emp.role, // Tambahkan role untuk PayrollTable
            division: emp.division,
            basic, // Detail gaji pokok
            allowance, // Detail tunjangan
            overtimePay, // Detail lembur
            bonus, // Detail bonus
            deductions: deductionsOther, // Potongan non-absensi
            lateDeduction, // Potongan terlambat
            earlyLeaveDeduction, // Potongan pulang cepat
            grossSalary,
            totalDeductions,
            net: netSalary, // Ganti netSalary menjadi net agar sinkron dengan PayrollTable
            lateCount: totalLate,
            earlyLeaveCount: totalEarlyLeave,
            status: 'Completed', 
        };
    });
};
// --- END LOGIKA UTAMA ---

const OwnerPayrollReport = ({ employees, workSettings }) => {
    const payrollData = useMemo(() => generatePayrollData(employees, workSettings), [employees, workSettings]);
    const [filterDivision, setFilterDivision] = useState('All');
    const uniqueDivisions = ['All', ...new Set(employees.map(e => e.division))];

    const filteredData = payrollData.filter(d => 
        filterDivision === 'All' || d.division === filterDivision
    );

    const monthYear = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    // Kolom untuk ReportGenerator (ekspor PDF/Excel)
    const payrollColumns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Nama', dataKey: 'name' },
        { header: 'Role', dataKey: 'role', format: (v) => v.toUpperCase() },
        { header: 'Divisi', dataKey: 'division' },
        { header: 'Gaji Pokok', dataKey: 'basic', format: formattedCurrency },
        { header: 'Tunjangan', dataKey: 'allowance', format: formattedCurrency },
        { header: 'Lembur', dataKey: 'overtimePay', format: formattedCurrency },
        { header: 'Bonus', dataKey: 'bonus', format: formattedCurrency },
        { header: 'Potongan Non-Absensi', dataKey: 'deductions', format: formattedCurrency },
        { header: 'Potongan Absensi', dataKey: 'lateDeduction', format: (v, item) => formattedCurrency(v + (item.earlyLeaveDeduction || 0)) },
        { header: 'Gaji Bersih', dataKey: 'net', format: formattedCurrency },
        { header: 'Status', dataKey: 'status' },
    ];


    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laporan Penggajian Perusahaan</h2>
            <h3 className="text-xl font-semibold text-gray-700">Periode: {monthYear}</h3>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
                <div className="flex items-center">
                    <label htmlFor="division-filter" className="text-sm font-medium text-gray-700 mr-2">Filter Divisi:</label>
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
                {/* Ganti tombol export manual dengan ReportGenerator */}
                <ReportGenerator 
                    title={`Laporan Gaji Personil - ${monthYear}`}
                    data={filteredData}
                    columns={payrollColumns}
                    filename={`LaporanGaji_${new Date().toISOString().split('T')[0]}_${filterDivision}`}
                    buttonText="Download Laporan Gaji"
                />
            </div>
            
            {/* Ganti tabel HTML manual dengan PayrollTable */}
            <PayrollTable payrollData={filteredData} showRole={true} />

        </GlassCard>
    );
};

export default OwnerPayrollReport;