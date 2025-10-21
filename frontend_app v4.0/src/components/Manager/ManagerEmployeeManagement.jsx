// src/components/Manager/ManagerEmployeeManagement.jsx
import React, { useState } from 'react';
import {  GlassCard } from '../UI/Cards';
import { PrimaryButton } from '../UI/Buttons';
import { showSwal } from '../../utils/swal';

// --- B5. Manajemen Karyawan ---
const ManagerEmployeeManagement = ({ employees, setEmployees }) => {
    // Pindahkan semua state, ref, dan handler dari fungsi ManagerEmployeeManagement di ManagerDashboard.jsx ke sini.
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const filteredEmployees = employees.filter(employee =>
        employee.role === 'employee' && employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // --- Handlers ---
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setEditFormData({ 
            status: employee.status, 
            cutiBalance: employee.cutiBalance 
        });
        setIsEditing(false);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateEmployee = () => {
        setEmployees(prevEmployees => 
            prevEmployees.map(emp => 
                emp.id === selectedEmployee.id
                    ? { ...emp, status: editFormData.status, cutiBalance: parseInt(editFormData.cutiBalance) }
                    : emp
            )
        );
        setSelectedEmployee(prev => ({ 
            ...prev, 
            status: editFormData.status, 
            cutiBalance: parseInt(editFormData.cutiBalance) 
        }));
        setIsEditing(false);
        showSwal('Berhasil', `Data ${selectedEmployee.name} berhasil diperbarui.`, 'success');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-user-friends mr-3 text-purple-600"></i> Manajemen Karyawan
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Daftar Karyawan */}
                <GlassCard className="lg:col-span-1 p-4 h-[70vh] overflow-y-auto">
                    <input
                        type="text"
                        placeholder="Cari nama karyawan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                    <ul className="space-y-2">
                        {filteredEmployees.map(employee => (
                            <li
                                key={employee.id}
                                onClick={() => handleSelectEmployee(employee)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                                    selectedEmployee?.id === employee.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">{employee.name}</p>
                                    <p className="text-xs text-gray-500">{employee.division}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {employee.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </GlassCard>

                {/* Kolom Kanan: Detail & Edit */}
                <GlassCard className="lg:col-span-2 p-6">
                    {selectedEmployee ? (
                        <>
                            <div className="flex justify-between items-center border-b pb-3 mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{selectedEmployee.name}</h3>
                                {isEditing ? (
                                    <div className="space-x-2">
                                        <PrimaryButton onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-sm py-2">Batal</PrimaryButton>
                                        <PrimaryButton onClick={handleUpdateEmployee} className="text-sm py-2">Simpan</PrimaryButton>
                                    </div>
                                ) : (
                                    <PrimaryButton onClick={() => setIsEditing(true)} className="text-sm py-2">
                                        <i className="fas fa-edit mr-2"></i> Edit Data
                                    </PrimaryButton>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Status Karyawan */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status Karyawan</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={editFormData.status}
                                        onChange={handleEditChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg ${isEditing ? 'border-blue-300' : 'border-gray-200 bg-gray-50'}`}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>
                                
                                {/* Saldo Cuti */}
                                <div>
                                    <label htmlFor="cutiBalance" className="block text-sm font-medium text-gray-700 mb-1">Saldo Cuti Tahunan (Hari)</label>
                                    <input
                                        type="number"
                                        id="cutiBalance"
                                        name="cutiBalance"
                                        value={editFormData.cutiBalance}
                                        onChange={handleEditChange}
                                        disabled={!isEditing}
                                        min="0"
                                        className={`w-full p-3 border rounded-lg ${isEditing ? 'border-blue-300' : 'border-gray-200 bg-gray-50'}`}
                                    />
                                </div>
                                
                                {/* Info Tambahan (Read-only) */}
                                <p className="text-sm text-gray-600">Email: {selectedEmployee.email}</p>
                                <p className="text-sm text-gray-600">Bergabung: {selectedEmployee.joinDate}</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 mt-10">Pilih karyawan di sebelah kiri untuk melihat detail dan mengedit.</p>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default ManagerEmployeeManagement;