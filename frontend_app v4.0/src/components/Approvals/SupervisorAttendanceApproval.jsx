// src/components/Approvals/SupervisorAttendanceApproval.jsx
import React, { useState } from 'react';
import { GlassCard } from '../UI/Cards.jsx';
import { PrimaryButton } from '../UI/Buttons.jsx';
import { showSwal } from '../../utils/swal.js';

// --- D3. Persetujuan Koreksi Absensi Supervisor ---
const SupervisorAttendanceApproval = ({ pendingAttendance, setPendingAttendance, employees, setEmployees }) => {
    const [filterStatus, setFilterStatus] = useState('Pending');

    // Asumsi: pendingAttendance datang dari props App.jsx
    const filteredAttendance = pendingAttendance.filter(req => req.status === filterStatus);

    // Handler untuk menyetujui/menolak permintaan koreksi
    const handleApproval = (requestId, status) => {
        // 1. Dapatkan permintaan yang relevan
        const requestToUpdate = pendingAttendance.find(req => req.id === requestId);

        if (!requestToUpdate) return;
        
        // 2. Tampilkan konfirmasi SweetAlert
        showSwal(
            `${status === 'Approved' ? 'Setujui' : 'Tolak'} Koreksi Absensi?`,
            `Yakin ingin **${status === 'Approved' ? 'menyetujui' : 'menolak'}** permintaan: **${requestToUpdate.requestType}** dari ${requestToUpdate.employeeName} pada ${requestToUpdate.requestedDate}?`,
            'question',
            0,
            true, // showCancelButton
            async () => {
                // 3. Update status permintaan di state lokal
                const updatedPendingAttendance = pendingAttendance.map(req => 
                    req.id === requestId ? { ...req, status: status, approvedBy: 'Supervisor', approvedAt: new Date().toISOString().split('T')[0] } : req
                );
                
                setPendingAttendance(updatedPendingAttendance.filter(req => req.status === 'Pending')); // Hanya simpan yang masih Pending

                // 4. (Simulasi) Beri dampak pada data karyawan
                if (status === 'Approved') {
                    // Logika simulasi: Jika disetujui, update riwayat absensi karyawan
                    const updatedEmployees = employees.map(emp => {
                        if (emp.id === requestToUpdate.employeeId) {
                            const { correctionData } = requestToUpdate;
                            const updatedAttendance = emp.currentMonthAttendance.map(att => {
                                // Cek jika ada absensi yang perlu diganti (e.g., location mismatch)
                                if (att.date === requestToUpdate.requestedDate && att.type === correctionData.type) {
                                    return { ...att, ...correctionData, corrected: true };
                                }
                                return att;
                            });

                            // Jika request adalah Missed Clock In/Out, tambahkan record baru
                            if (requestToUpdate.requestType.includes('Missed')) {
                                const newRecord = {
                                    date: requestToUpdate.requestedDate,
                                    time: correctionData.time,
                                    type: correctionData.type,
                                    location: correctionData.location || 'Manual Correction (Approved)',
                                    late: false, // Asumsi koreksi selalu dianggap tepat waktu
                                    earlyLeave: false,
                                    corrected: true,
                                };
                                updatedAttendance.push(newRecord);
                            }
                            
                            // Pastikan tidak ada duplikasi
                            const uniqueAttendance = updatedAttendance.filter((att, index, self) => 
                                index === self.findIndex((t) => (
                                    t.date === att.date && t.type === att.type
                                ))
                            );

                            return { ...emp, currentMonthAttendance: uniqueAttendance };
                        }
                        return emp;
                    });
                    setEmployees(updatedEmployees);
                }

                showSwal(
                    'Sukses!', 
                    `Permintaan **${requestToUpdate.requestType}** telah di-${status === 'Approved' ? 'SETUJUI' : 'TOLAK'}.`, 
                    status === 'Approved' ? 'success' : 'error', 
                    3000
                );
            }
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-user-check mr-3 text-orange-600"></i> Persetujuan Koreksi Absensi
            </h2>

            <GlassCard>
                {/* Filter */}
                <div className="flex justify-start mb-6 space-x-3">
                    <PrimaryButton 
                        onClick={() => setFilterStatus('Pending')}
                        className={filterStatus === 'Pending' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 hover:bg-gray-500'}
                    >
                        <i className="fas fa-hourglass-half mr-2"></i> Pending ({pendingAttendance?.length || 0})
                    </PrimaryButton>
                    {/* Tambahkan tombol untuk melihat Approved/Rejected jika perlu */}
                </div>

                {/* Daftar Permintaan Koreksi */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {filteredAttendance.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Tidak ada permintaan koreksi absensi yang menunggu persetujuan.</p>
                    ) : (
                        filteredAttendance.map(req => (
                            <div key={req.id} className="p-5 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{req.requestType}</h3>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Perlu Koreksi
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Dari: <span className="font-medium text-gray-800">{req.employeeName} ({req.division})</span></p>
                                <p className="text-sm text-red-500 font-medium mb-1"><i className="fas fa-calendar-day mr-1"></i> Tanggal: {req.requestedDate}</p>
                                <p className="text-sm text-gray-500 italic mb-4">Alasan: "{req.reason}"</p>
                                
                                {/* Detail Koreksi */}
                                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                                    <p className="font-semibold text-blue-800">Data Koreksi:</p>
                                    <p className="text-sm text-blue-700">Tipe: {req.correctionData.type} | Pukul: {req.correctionData.time}</p>
                                    {req.correctionData.location && <p className="text-xs text-blue-600">Lokasi: {req.correctionData.location}</p>}
                                </div>

                                <div className="flex justify-end items-center border-t pt-3">
                                    <div className="flex space-x-3">
                                        <PrimaryButton 
                                            onClick={() => handleApproval(req.id, 'Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-sm py-2 px-3"
                                        >
                                            <i className="fas fa-check-circle mr-2"></i> Setuju & Koreksi
                                        </PrimaryButton>
                                        <PrimaryButton 
                                            onClick={() => handleApproval(req.id, 'Rejected')}
                                            className="bg-red-500 hover:bg-red-600 text-sm py-2 px-3"
                                        >
                                            <i className="fas fa-times-circle mr-2"></i> Tolak
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default SupervisorAttendanceApproval;