// src/components/Reporting/ManagerPayrollReport.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../Shared/Modals/componentsUtilityUI'; 
import { DUMMY_MANAGER_REPORTS } from '../../utils/constants'; 
import { formattedCurrency } from '../../utils/formatters';
import PayrollTable from '../Reporting/PayrollTable';
import ReportGenerator from '../Reporting/ReportGenerator';
import SalaryAdjustmentModal from './SalaryAdjustmentModal'; // ✨ Modal baru untuk naik/potong gaji

const ManagerPayrollReport = ({ workSettings }) => { 
    const [selectedMonth, setSelectedMonth] = useState('2024-08');
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Data dengan mapping yang lebih clean
    const reports = useMemo(() => DUMMY_MANAGER_REPORTS.map(r => ({
        id: r.id,
        name: r.name,
        division: r.division || 'Tim Manager',
        role: r.role,
        basic: r.salary || 0,
        allowance: r.allowance || 0,
        overtimePay: r.overtimePay || 0,
        bonus: r.bonus || 0,
        deductions: r.deductions || 0,
        lateDeduction: r.lateDeduction || 0,
        earlyLeaveDeduction: r.earlyLeaveDeduction || 0,
        net: r.net || (r.salary + r.allowance - r.deductions),
        status: r.status || 'Completed',
        // Data detail pemotongan untuk modal
        deductionDetails: r.deductionDetails || [
            { type: 'BPJS Kesehatan', amount: 150000 },
            { type: 'BPJS Ketenagakerjaan', amount: 80000 },
            { type: 'Pajak Penghasilan', amount: 200000 }
        ]
    })), []);

    const payrollColumns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Nama', dataKey: 'name' },
        { header: 'Divisi', dataKey: 'division' },
        { header: 'Gaji Pokok', dataKey: 'basic', format: formattedCurrency },
        { header: 'Tunjangan', dataKey: 'allowance', format: formattedCurrency },
        { header: 'Lembur', dataKey: 'overtimePay', format: formattedCurrency },
        { header: 'Bonus', dataKey: 'bonus', format: formattedCurrency },
        { header: 'Total Potongan', dataKey: 'deductions', format: formattedCurrency },
        { header: 'Gaji Bersih', dataKey: 'net', format: formattedCurrency },
        { header: 'Status', dataKey: 'status' },
    ];

    const handleAdjustSalary = (employee) => {
        setSelectedEmployee(employee);
        setShowAdjustmentModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 text-left">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div className="mb-4 lg:mb-0">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                        <i className="fas fa-file-invoice-dollar mr-3 text-[#708993]"></i>
                        Laporan Penggajian Tim
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Kelola dan pantau penggajian tim Anda</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#708993]/30 text-black"
                    >
                        <option value="2024-08">Agustus 2024</option>
                        <option value="2024-07">Juli 2024</option>
                        <option value="2024-06">Juni 2024</option>
                    </select>

                    <button
                        onClick={() => handleAdjustSalary(null)}
                        className="px-4 py-2 bg-[#708993] text-white rounded-2xl text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:bg-[#5a717b] active:scale-95"
                    >
                        <i className="fas fa-edit mr-2"></i>
                        Atur Penggajian
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <GlassCard className="backdrop-blur-lg bg-white/40 border border-white/50 rounded-3xl p-6">
                {/* Export Controls */}
                <div className="mb-6">
                    <ReportGenerator 
                        title={`Laporan Gaji Tim - Periode ${selectedMonth}`}
                        data={reports}
                        columns={payrollColumns}
                        filename={`Laporan_Gaji_Tim_${selectedMonth}`}
                        className="justify-end"
                    />
                </div>

                {/* Payroll Table */}
                <PayrollTable 
                    payrollData={reports} 
                    showRole={false}
                    onAdjustSalary={handleAdjustSalary}
                />

                {reports.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-inbox text-4xl text-gray-400 mb-3"></i>
                        <p className="text-gray-500">Tidak ada data laporan gaji untuk periode ini.</p>
                    </div>
                )}
            </GlassCard>

            {/* Salary Adjustment Modal */}
            {showAdjustmentModal && (
                <SalaryAdjustmentModal
                    employee={selectedEmployee}
                    onClose={() => setShowAdjustmentModal(false)}
                    onSave={(adjustmentData) => {
                        console.log('Data penyesuaian:', adjustmentData);
                        // Implementasi save logic di sini
                        setShowAdjustmentModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ManagerPayrollReport;