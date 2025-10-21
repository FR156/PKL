// src/pages/Dashboard/OwnerDashboard/OwnerWorkSettings.jsx
import React, { useState, useEffect } from 'react';
import { GlassCard, PrimaryButton } from "../../../components/Shared/Modals/componentsUtilityUI";
import { showSwal } from '../../../utils/swal';
import { formattedCurrency } from '../../../utils/formatters';

const OwnerWorkSettings = ({ workSettings, setWorkSettings }) => {
    // Gunakan state lokal untuk form
    const [formData, setFormData] = useState({ 
        ...workSettings,
        lateDeduction: workSettings.lateDeduction || 50000,
        earlyLeaveDeduction: workSettings.earlyLeaveDeduction || 75000,
    });

    useEffect(() => {
        // Sinkronisasi jika prop workSettings berubah dari luar (misal dari localStorage)
        setFormData(workSettings);
    }, [workSettings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name.includes('Deduction') ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi waktu
        if (formData.startTime >= formData.endTime) {
            showSwal('Gagal', 'Jam Selesai harus lebih besar dari Jam Mulai.', 'error');
            return;
        }

        // Terapkan perubahan ke state utama
        setWorkSettings(formData);

        showSwal('Sukses!', 'Pengaturan jam kerja dan potongan berhasil diperbarui.', 'success', 2000);
    };

    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Pengaturan Jam Kerja & Potongan</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jam Mulai */}
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Jam Mulai Standar</label>
                        <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime || '08:00'}
                            onChange={handleChange}
                            required
                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Jam Selesai */}
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Jam Selesai Standar</label>
                        <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime || '17:00'}
                            onChange={handleChange}
                            required
                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-700 pt-4">Tarif Potongan (Per Kejadian)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Potongan Keterlambatan */}
                    <div>
                        <label htmlFor="lateDeduction" className="block text-sm font-medium text-gray-700">Potongan Keterlambatan</label>
                        <input
                            type="number"
                            id="lateDeduction"
                            name="lateDeduction"
                            value={formData.lateDeduction || 0}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Saat ini: {formattedCurrency(formData.lateDeduction || 0)}</p>
                    </div>

                    {/* Potongan Pulang Cepat */}
                    <div>
                        <label htmlFor="earlyLeaveDeduction" className="block text-sm font-medium text-gray-700">Potongan Pulang Cepat</label>
                        <input
                            type="number"
                            id="earlyLeaveDeduction"
                            name="earlyLeaveDeduction"
                            value={formData.earlyLeaveDeduction || 0}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                         <p className="mt-1 text-xs text-gray-500">Saat ini: {formattedCurrency(formData.earlyLeaveDeduction || 0)}</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <PrimaryButton type="submit">
                        <i className="fas fa-save mr-2"></i> Simpan Pengaturan
                    </PrimaryButton>
                </div>
            </form>
        </GlassCard>
    );
};

export default OwnerWorkSettings;