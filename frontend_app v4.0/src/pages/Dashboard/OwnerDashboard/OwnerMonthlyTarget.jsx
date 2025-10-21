// src/pages/Dashboard/OwnerDashboard/OwnerMonthlyTarget.jsx
import React, { useState } from 'react';
import { GlassCard, PrimaryButton } from '../../../components/Shared/Modals/componentsUtilityUI';
import { showSwal } from '../../../utils/swal';

// Fungsi helper untuk mendapatkan/mengubah bulan
const getMonthYear = (date) => new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
const currentMonthYear = getMonthYear(new Date());

// Asumsi: Setiap objek employee memiliki field `targets` (Array of { month: string, value: number })
// Kita akan menggunakan state sementara dan mengupdatenya ke employees.

// Kita harus memastikan employee data di state utama sudah memiliki structure targets: []
// Untuk meniru ini, kita akan membuat state lokal untuk target.
const initializeTargets = (employees) => {
    return employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        division: emp.division,
        // Dapatkan target saat ini, atau default ke 0
        currentTarget: emp.targets?.find(t => t.month === currentMonthYear)?.value || 0, 
    }));
};

const OwnerMonthlyTarget = ({ employees, setEmployees }) => {
    const [monthlyTargets, setMonthlyTargets] = useState(initializeTargets(employees));
    const [filterDivision, setFilterDivision] = useState('All');
    
    // Dapatkan daftar unik divisi
    const uniqueDivisions = ['All', ...new Set(employees.map(e => e.division))];

    const handleTargetChange = (id, value) => {
        setMonthlyTargets(prev => prev.map(target => 
            target.id === id ? { ...target, currentTarget: parseInt(value) || 0 } : target
        ));
    };

    const handleSave = (e) => {
        e.preventDefault();

        const updatedEmployees = employees.map(emp => {
            const targetEntry = monthlyTargets.find(t => t.id === emp.id);
            if (!targetEntry) return emp;
            
            // Perbarui/tambahkan target di array targets karyawan
            const existingTargetIndex = emp.targets?.findIndex(t => t.month === currentMonthYear);
            
            let newTargets = [...(emp.targets || [])];
            
            if (existingTargetIndex !== undefined && existingTargetIndex !== -1) {
                newTargets[existingTargetIndex] = { month: currentMonthYear, value: targetEntry.currentTarget };
            } else {
                newTargets.push({ month: currentMonthYear, value: targetEntry.currentTarget });
            }

            return { ...emp, targets: newTargets };
        });

        // Simpan ke state utama
        setEmployees(updatedEmployees);

        showSwal('Sukses!', `Target Bulan ${currentMonthYear} berhasil disimpan untuk semua karyawan.`, 'success', 2500);
    };

    const filteredTargets = monthlyTargets.filter(target => 
        filterDivision === 'All' || target.division === filterDivision
    );

    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Penetapan Target Bulanan ({currentMonthYear})</h2>
            
            <form onSubmit={handleSave}>
                <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
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
                    <PrimaryButton type="submit">
                        <i className="fas fa-bullseye mr-2"></i> Simpan Semua Target
                    </PrimaryButton>
                </div>
                
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Divisi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Target Bulanan (Qty)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTargets.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.division}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <input
                                            type="number"
                                            value={t.currentTarget || 0}
                                            onChange={(e) => handleTargetChange(t.id, e.target.value)}
                                            min="0"
                                            className="w-28 p-2 border rounded text-center focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </form>
        </GlassCard>
    );
};

export default OwnerMonthlyTarget;