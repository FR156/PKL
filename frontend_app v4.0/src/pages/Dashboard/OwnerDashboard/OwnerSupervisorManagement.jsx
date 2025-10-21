// src/pages/Dashboard/OwnerDashboard/OwnerSupervisorManagement.jsx
import React, { useState } from 'react';
import { GlassCard, PrimaryButton } from '../../../components/Shared/Modals/componentsUtilityUI';
import { showSwal } from '../../../utils/swal';
import { formattedCurrency } from '../../../utils/formatters';

const roles = ['supervisor'];
const divisions = ['Tech', 'Marketing', 'Finance', 'HR', 'Operations'];

const OwnerSupervisorManagement = ({ supervisors, setSupervisors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSupervisor, setCurrentSupervisor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormData = {
        id: Date.now(),
        name: '',
        division: divisions[0],
        email: '',
        phone: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        role: 'supervisor',
        // Dummy default data
        salaryDetails: { basic: 10000000, allowance: 2500000, overtimeHours: 0, overtimeRate: 0, bonus: 0, deductions: 0 },
    };

    const [formData, setFormData] = useState(initialFormData);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openEditModal = (supervisor) => {
        setIsEditing(true);
        setCurrentSupervisor(supervisor);
        setFormData({ 
            ...supervisor, 
            salaryDetails: supervisor.salaryDetails || initialFormData.salaryDetails,
            joinDate: supervisor.joinDate ? new Date(supervisor.joinDate).toISOString().split('T')[0] : initialFormData.joinDate
        });
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('salaryDetails.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                salaryDetails: {
                    ...prev.salaryDetails,
                    [key]: parseInt(value) || 0,
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update Supervisor
            setSupervisors(supervisors.map(sprv => 
                sprv.id === currentSupervisor.id ? { ...formData, id: currentSupervisor.id } : sprv
            ));
            showSwal('Sukses!', `Data Supervisor ${formData.name} berhasil diperbarui.`, 'success', 2000);
        } else {
            // Create New Supervisor (ID sudah otomatis di set di initialFormData)
            setSupervisors([...supervisors, { ...formData, id: Date.now() }]);
            showSwal('Sukses!', `Supervisor baru ${formData.name} berhasil ditambahkan.`, 'success', 2000);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        showSwal('Konfirmasi Hapus', 'Anda yakin ingin menghapus data supervisor ini?', 'warning', 0, true, 'Ya, Hapus!').then((result) => {
            if (result.isConfirmed) {
                setSupervisors(supervisors.filter(sprv => sprv.id !== id));
                showSwal('Terhapus!', 'Data supervisor berhasil dihapus.', 'success', 2000);
            }
        });
    };

    const filteredSupervisors = supervisors.filter(sprv =>
        sprv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sprv.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(sprv.id).includes(searchTerm)
    );

    // --- Component Modal ---
    const SupervisorModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-50" onClick={onClose}>
                <GlassCard className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? `Edit Supervisor: ${currentSupervisor.name}` : 'Tambah Supervisor Baru'}</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nama */}
                            <input type="text" name="name" placeholder="Nama Supervisor" value={formData.name} onChange={handleFormChange} required className="p-3 border rounded" />
                            
                            {/* Email */}
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleFormChange} required className="p-3 border rounded" />
                            
                            {/* Telepon */}
                            <input type="text" name="phone" placeholder="Nomor Telepon" value={formData.phone} onChange={handleFormChange} className="p-3 border rounded" />
                            
                            {/* Tanggal Gabung */}
                            <input type="date" name="joinDate" placeholder="Tanggal Gabung" value={formData.joinDate} onChange={handleFormChange} required className="p-3 border rounded text-gray-700" />
                            
                            {/* Divisi */}
                            <select name="division" value={formData.division} onChange={handleFormChange} className="p-3 border rounded bg-white text-gray-700" required>
                                {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                            </select>

                             {/* Status */}
                            <select name="status" value={formData.status} onChange={handleFormChange} className="p-3 border rounded bg-white text-gray-700" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        
                        <h4 className="text-xl font-semibold text-gray-700 pt-4 border-t mt-4">Detail Gaji (Bulanan)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="number" name="salaryDetails.basic" placeholder="Gaji Pokok" value={formData.salaryDetails.basic} onChange={handleFormChange} required min="0" className="p-3 border rounded" />
                            <input type="number" name="salaryDetails.allowance" placeholder="Tunjangan" value={formData.salaryDetails.allowance} onChange={handleFormChange} required min="0" className="p-3 border rounded" />
                            <input type="number" name="salaryDetails.deductions" placeholder="Potongan Lain-lain" value={formData.salaryDetails.deductions} onChange={handleFormChange} required min="0" className="p-3 border rounded" />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <PrimaryButton type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
                                Batal
                            </PrimaryButton>
                            <PrimaryButton type="submit">
                                <i className="fas fa-save mr-2"></i> {isEditing ? 'Simpan Perubahan' : 'Tambah Supervisor'}
                            </PrimaryButton>
                        </div>
                    </form>
                </GlassCard>
            </div>
        );
    };
    // --- End Component Modal ---

    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Supervisor (CRUD)</h2>
            
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Cari Nama/ID/Divisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-3 border rounded-lg w-full md:w-80"
                />
                <PrimaryButton onClick={openCreateModal}>
                    <i className="fas fa-plus mr-2"></i> Tambah Supervisor
                </PrimaryButton>
            </div>
            
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-orange-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama & Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Gaji Bersih</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSupervisors.map(sprv => (
                            <tr key={sprv.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sprv.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{sprv.name}</div>
                                    <div className="text-xs text-gray-500">{sprv.division}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formattedCurrency(sprv.salaryDetails.basic + sprv.salaryDetails.allowance - sprv.salaryDetails.deductions)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sprv.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {sprv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <PrimaryButton onClick={() => openEditModal(sprv)} className="bg-yellow-500 hover:bg-yellow-600 p-2 text-sm">
                                        <i className="fas fa-edit"></i> Edit
                                    </PrimaryButton>
                                    <PrimaryButton onClick={() => handleDelete(sprv.id)} className="bg-red-500 hover:bg-red-600 p-2 text-sm">
                                        <i className="fas fa-trash"></i> Hapus
                                    </PrimaryButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SupervisorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </GlassCard>
    );
};

export default OwnerSupervisorManagement;