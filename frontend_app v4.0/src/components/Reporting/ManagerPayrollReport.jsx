// src/components/Reporting/ManagerPayrollReport.jsx
import React, { useState, useMemo } from 'react';
// import GlassCard dan formattedCurrency saja dari componentsUtilityUI dan constants
import { GlassCard } from '../Shared/Modals/componentsUtilityUI'; 
import {  DUMMY_MANAGER_REPORTS } from '../../utils/constants'; 
import { formattedCurrency } from '../../utils/formatters';
import PayrollTable from '../Reporting/PayrollTable'; // ✨ Import komponen baru
import ReportGenerator from '../Reporting/ReportGenerator'; // ✨ Import komponen baru

// Hapus 'employees' dari props karena tidak digunakan.
// Ganti props menjadi destructuring yang diperlukan saja:
const ManagerPayrollReport = ({ workSettings }) => { 
    // Data Report diambil dari constants atau props, untuk simulasi kita pakai DUMMY_MANAGER_REPORTS
    // ASUMSI: Data di DUMMY_MANAGER_REPORTS sudah disesuaikan agar cocok dengan PayrollTable.
    const reports = useMemo(() => DUMMY_MANAGER_REPORTS.map(r => ({
        // Memastikan semua key yang dibutuhkan PayrollTable ada
        ...r,
        division: r.division || 'Tim Manager', 
        basic: r.salary || 0, // Menggunakan salary sebagai basic jika struktur dummy sederhana
        overtimePay: r.overtimePay || 0,
        bonus: r.bonus || 0,
        // Asumsi data dummy manager sudah memasukkan potongan absensi (lateDeduction/earlyLeaveDeduction)
        // Jika tidak ada, atur ke 0 agar tidak error saat render di PayrollTable.
        lateDeduction: r.lateDeduction || 0,
        earlyLeaveDeduction: r.earlyLeaveDeduction || 0,
        net: r.net || (r.salary + r.allowance - r.deductions), // Memastikan 'net' ada
        
    })), []); 

    const [selectedMonth, setSelectedMonth] = useState('2024-08');

    // Kolom yang akan digunakan oleh ReportGenerator (untuk ekspor PDF/Excel)
    const payrollColumns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Nama', dataKey: 'name' },
        { header: 'Divisi', dataKey: 'division' },
        { header: 'Gaji Pokok', dataKey: 'basic', format: formattedCurrency },
        { header: 'Tunjangan', dataKey: 'allowance', format: formattedCurrency },
        { header: 'Lembur', dataKey: 'overtimePay', format: formattedCurrency },
        { header: 'Bonus', dataKey: 'bonus', format: formattedCurrency },
        { header: 'Potongan Lain-lain', dataKey: 'deductions', format: formattedCurrency },
        { header: 'Potongan Absensi', dataKey: 'lateDeduction', format: (v, item) => formattedCurrency(v + (item.earlyLeaveDeduction || 0)) },
        { header: 'Gaji Bersih', dataKey: 'net', format: formattedCurrency },
        { header: 'Status', dataKey: 'status' },
    ];
    
    // --- Render ---
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-file-invoice-dollar mr-3 text-green-600"></i> Laporan Penggajian Tim
            </h2>

            <GlassCard>
                {/* Kontrol Filter & Export */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <label htmlFor="month-select" className="font-medium text-gray-700">Periode:</label>
                        <select
                            id="month-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                        >
                            <option value="2024-08">Agustus 2024</option>
                            <option value="2024-07">Juli 2024</option>
                            {/* Tambahkan opsi bulan lain di sini */}
                        </select>
                    </div>

                    <ReportGenerator 
                        title={`Laporan Gaji Tim - Periode ${selectedMonth}`}
                        data={reports}
                        columns={payrollColumns}
                        filename={`Laporan_Gaji_Tim_${selectedMonth}`}
                        buttonText="Download Laporan"
                    />
                </div>

                {/* Ganti tabel HTML manual dengan PayrollTable */}
                <PayrollTable payrollData={reports} showRole={false} />

                {reports.length === 0 && (
                    <p className="text-center text-gray-500 p-6">Tidak ada data laporan gaji untuk periode ini.</p>
                )}

            </GlassCard>
        </div>
    );
};

export default ManagerPayrollReport;