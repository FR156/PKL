// src/components/Approvals/ManagerLeaveApproval.jsx
import React from 'react';
import { PrimaryButton } from '../UI/Buttons'; 
import { GlassCard } from '../UI/Cards';
import { showSwal } from '../../utils/swal';

// --- B2. Persetujuan Cuti ---
const ManagerLeaveApproval = ({ employees, setEmployees, pendingLeave, setPendingLeave }) => {
    
    // Handler untuk menyetujui (Approve) permintaan cuti
    const handleApprove = (request) => {
        // 1. Tambahkan ke data attendance (Simulasi: status cuti sebagai 'On Leave')
        const updatedEmployees = employees.map(emp => {
            if (emp.id === request.employeeId) {
                // Kurangi saldo cuti (asumsi request.days sudah benar di data dummy)
                const newCutiBalance = emp.cutiBalance - request.days;
                return { 
                    ...emp, 
                    cutiBalance: newCutiBalance >= 0 ? newCutiBalance : 0 
                };
            }
            return emp;
        });

        // 2. Hapus dari daftar pending
        const updatedPending = pendingLeave.filter(p => p.id !== request.id);

        // 3. Update state
        setEmployees(updatedEmployees);
        setPendingLeave(updatedPending);

        showSwal('Disetujui!', `Permintaan cuti ${request.employeeName} (${request.type}) telah disetujui.`, 'success');
    };

    // Handler untuk menolak (Reject) permintaan cuti
    const handleReject = (requestId, employeeName) => {
        // Hapus dari daftar pending
        const updatedPending = pendingLeave.filter(p => p.id !== requestId);
        setPendingLeave(updatedPending);

        showSwal('Ditolak!', `Permintaan cuti ${employeeName} telah ditolak.`, 'error');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-plane-departure mr-3 text-yellow-600"></i> Persetujuan Cuti ({pendingLeave.length})
            </h2>

            <GlassCard>
                {pendingLeave.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        <i className="fas fa-check-circle mr-2 text-green-500"></i> Tidak ada permintaan cuti yang menunggu persetujuan.
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {pendingLeave.map(request => {
                            // Cari detail karyawan
                            const employeeDetail = employees.find(e => e.id === request.employeeId) || {};

                            return (
                                <div key={request.id} className="p-4 border-l-4 border-yellow-500 bg-white shadow-sm rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="mb-3 md:mb-0">
                                        <p className="text-lg font-bold text-gray-800">{request.employeeName}</p>
                                        <p className="text-sm font-medium text-yellow-700 mt-1 mb-2 px-2 py-1 bg-yellow-100 rounded-full inline-block">{request.type}</p>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-semibold">Tanggal:</span> {request.startDate} {request.startDate !== request.endDate && `hingga ${request.endDate}`}</p>
                                            <p><span className="font-semibold">Lama:</span> {request.days} Hari</p>
                                            <p className="italic text-gray-500 mt-1">"{request.reason}"</p>
                                            <p className="text-xs text-blue-500 font-semibold mt-2">Sisa Cuti Karyawan: {employeeDetail.cutiBalance} Hari</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 flex-shrink-0">
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
                            );
                        })}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ManagerLeaveApproval;