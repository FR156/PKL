// src/components/PayrollTable.jsx
import React from 'react';
import { formattedCurrency } from '../../utils/formatters'; // Utilitas dari constants.js

/**
 * Komponen reusable untuk menampilkan tabel Laporan Gaji.
 *
 * @param {Array<object>} payrollData - Data laporan gaji yang sudah diproses.
 * @param {boolean} showRole - Menampilkan kolom Role (true untuk Owner, false untuk Manager).
 */
const PayrollTable = ({ payrollData, showRole = true }) => {
    
    // Hitung total keseluruhan untuk footer tabel
    const totalGross = payrollData.reduce((sum, item) => sum + (item.basic + item.allowance + item.overtimePay + item.bonus), 0);
    const totalDeductions = payrollData.reduce((sum, item) => sum + (item.deductions + item.lateDeduction + item.earlyLeaveDeduction), 0);
    const totalNet = payrollData.reduce((sum, item) => sum + item.net, 0);

    return (
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-100/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama</th>
                        {showRole && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Gaji Pokok</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tunjangan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lembur</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bonus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider text-red-600">Potongan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider text-indigo-600">Gaji Bersih</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payrollData.map((report, index) => (
                        <tr key={report.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {report.name} <br/>
                                <span className="text-xs text-gray-500">{report.division}</span>
                            </td>
                            {showRole && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{report.role}</td>
                            )}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formattedCurrency(report.basic)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formattedCurrency(report.allowance)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{formattedCurrency(report.overtimePay)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{formattedCurrency(report.bonus)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">{formattedCurrency(report.deductions + report.lateDeduction + report.earlyLeaveDeduction)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-indigo-700 font-bold">{formattedCurrency(report.net)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {report.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    
                    {/* Footer Total */}
                    {payrollData.length > 0 && (
                         <tr className="bg-blue-50 font-extrabold border-t-2 border-blue-200">
                            <td className={`px-4 py-3 whitespace-nowrap text-base text-gray-900 ${showRole ? 'col-span-2' : ''}`} colSpan={showRole ? 2 : 1}>Total Pembayaran:</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{formattedCurrency(payrollData.reduce((sum, item) => sum + item.basic, 0))}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{formattedCurrency(payrollData.reduce((sum, item) => sum + item.allowance, 0))}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-green-600">{formattedCurrency(payrollData.reduce((sum, item) => sum + item.overtimePay, 0))}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-green-600">{formattedCurrency(payrollData.reduce((sum, item) => sum + item.bonus, 0))}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-base text-red-600 font-medium">{formattedCurrency(totalDeductions)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-lg text-indigo-700">{formattedCurrency(totalNet)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollTable;