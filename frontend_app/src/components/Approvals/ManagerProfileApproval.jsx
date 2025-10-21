// src/components/Approvals/ManagerProfileApproval.jsx
import React from 'react';
import { PrimaryButton } from '../UI/Buttons'; 
import { GlassCard } from '../UI/Cards';
import { showSwal } from '../../utils/swal';

// --- B3. Persetujuan Perubahan Profil ---
const ManagerProfileApproval = ({ employees, setEmployees, pendingProfileChanges, setPendingProfileChanges, setAuthUser }) => {
    
    // Fungsi untuk memformat daftar perubahan
    const formatChanges = (changes) => {
        const list = [];
        for (const key in changes) {
            let value = changes[key];
            let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            if (key === 'profileImage') {
                list.push(<li key={key} className="text-sm text-blue-600 font-medium">🖼️ Foto Profil: <span className="text-gray-700">Perubahan gambar</span></li>);
            } else if (key === 'cvFile' || key === 'diplomaFile') {
                const fileName = value?.name || 'File Baru';
                list.push(<li key={key} className="text-sm text-blue-600 font-medium">📄 {label}: <span className="text-gray-700">Upload {fileName}</span></li>);
            } else {
                 // Cari nilai lama dari data karyawan yang bersangkutan (simulasi)
                const employee = employees.find(e => e.id === changes.employeeId) || {};
                const oldValue = employee[key] || 'N/A';
                
                list.push(<li key={key} className="text-sm text-blue-600 font-medium">{label}: <span className="text-gray-700 line-through mr-1 text-red-500">{oldValue}</span> → <span className="text-green-600">{value}</span></li>);
            }
        }
        return <ul className="list-disc list-inside mt-2 space-y-1">{list}</ul>;
    };

    // Handler untuk menyetujui (Approve) perubahan profil
    const handleApprove = (request) => {
        // 1. Terapkan perubahan ke data karyawan
        const updatedEmployees = employees.map(emp => {
            if (emp.id === request.employeeId) {
                // Terapkan semua perubahan
                const updated = { ...emp, ...request.requestedChanges };

                // Khusus file: Simpan metadata file (simulasi)
                if (request.requestedChanges.cvFile) updated.cvFile = request.requestedChanges.cvFile;
                if (request.requestedChanges.diplomaFile) updated.diplomaFile = request.requestedChanges.diplomaFile;
                
                return updated;
            }
            return emp;
        });

        // 2. Update state global
        setEmployees(updatedEmployees);
        
        // 3. Jika yang diupdate adalah user yang sedang login, update authUser juga
        if (request.employeeId === employees.find(e => e.role === 'manager')?.id) {
             const updatedManager = updatedEmployees.find(e => e.id === request.employeeId);
             setAuthUser(updatedManager);
        }

        // 4. Hapus dari daftar pending
        const updatedPending = pendingProfileChanges.filter(p => p.id !== request.id);
        setPendingProfileChanges(updatedPending);

        showSwal('Disetujui!', `Perubahan profil ${request.employeeName} telah disetujui dan diterapkan.`, 'success');
    };

    // Handler untuk menolak (Reject) perubahan profil
    const handleReject = (requestId, employeeName) => {
        const updatedPending = pendingProfileChanges.filter(p => p.id !== requestId);
        setPendingProfileChanges(updatedPending);

        showSwal('Ditolak!', `Permintaan perubahan profil ${employeeName} telah ditolak.`, 'error');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-user-check mr-3 text-orange-600"></i> Persetujuan Perubahan Profil ({pendingProfileChanges.length})
            </h2>

            <GlassCard>
                {pendingProfileChanges.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        <i className="fas fa-check-circle mr-2 text-green-500"></i> Tidak ada permintaan perubahan profil yang menunggu persetujuan.
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {pendingProfileChanges.map(request => (
                            <div key={request.id} className="p-4 border-l-4 border-orange-500 bg-white shadow-sm rounded-lg flex flex-col justify-between">
                                <div className="mb-3">
                                    <p className="text-lg font-bold text-gray-800">{request.employeeName}</p>
                                    <p className="text-sm text-gray-500">Diajukan pada: {request.requestedAt}</p>
                                    
                                    <h4 className="font-semibold text-gray-700 mt-3 border-b pb-1">Detail Perubahan:</h4>
                                    {formatChanges(request.requestedChanges)}
                                    
                                </div>
                                <div className="flex space-x-3 justify-end mt-4 pt-3 border-t">
                                    <PrimaryButton 
                                        onClick={() => handleApprove(request)} 
                                        className="bg-green-600 hover:bg-green-700 text-sm py-2 px-4"
                                    >
                                        <i className="fas fa-check mr-2"></i> Setujui
                                    </PrimaryButton>
                                    <PrimaryButton 
                                        onClick={() => handleReject(request.id, request.employeeName)} 
                                        className="bg-red-600 hover:bg-red-700 text-sm py-2 px-4"
                                    >
                                        <i className="fas fa-times mr-2"></i> Tolak
                                    </PrimaryButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ManagerProfileApproval;