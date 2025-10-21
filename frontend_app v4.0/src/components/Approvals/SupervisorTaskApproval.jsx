// src/components/Approvals/SupervisorTaskApproval.jsx
import React, { useState } from 'react';
import { GlassCard } from '../UI/Cards.jsx';
import { PrimaryButton } from '../UI/Buttons.jsx';
import { showSwal } from '../../utils/swal.js';

// --- D2. Persetujuan Tugas Supervisor ---
const SupervisorTaskApproval = ({ pendingTasks, setPendingTasks, employees, setEmployees }) => {
    const [filterStatus, setFilterStatus] = useState('Pending');
    
    // Asumsi: pendingTasks datang dari props App.jsx
    const filteredTasks = pendingTasks.filter(task => task.status === filterStatus);
    
    // Handler untuk menyetujui/menolak tugas
    const handleApproval = (taskId, status) => {
        // 1. Dapatkan tugas yang relevan
        const taskToUpdate = pendingTasks.find(t => t.id === taskId);

        if (!taskToUpdate) return;
        
        // 2. Tampilkan konfirmasi SweetAlert
        showSwal(
            `${status === 'Approved' ? 'Setujui' : 'Tolak'} Tugas?`,
            `Apakah Anda yakin ingin **${status === 'Approved' ? 'menyetujui' : 'menolak'}** tugas: **${taskToUpdate.taskTitle}** dari ${taskToUpdate.employeeName}?`,
            'question',
            0,
            true, // showCancelButton
            async () => {
                // 3. Update status tugas di state lokal
                const updatedPendingTasks = pendingTasks.map(t => 
                    t.id === taskId ? { ...t, status: status, approvedBy: 'Supervisor', approvedAt: new Date().toISOString().split('T')[0] } : t
                );
                
                setPendingTasks(updatedPendingTasks.filter(t => t.status === 'Pending')); // Hanya simpan yang masih Pending

                // 4. (Simulasi) Beri dampak pada data karyawan (misalnya, update status task/performance)
                if (status === 'Approved') {
                    // Logika simulasi: Jika disetujui, update karyawan (misal: +1 poin performance)
                    const updatedEmployees = employees.map(emp => {
                        if (emp.id === taskToUpdate.employeeId) {
                            return {
                                ...emp,
                                performanceScore: (emp.performanceScore || 0) + 1 // Simulasi: +1 point
                            };
                        }
                        return emp;
                    });
                    setEmployees(updatedEmployees);
                }

                showSwal(
                    'Sukses!', 
                    `Tugas **${taskToUpdate.taskTitle}** dari ${taskToUpdate.employeeName} telah di-${status === 'Approved' ? 'SETUJUI' : 'TOLAK'}.`, 
                    status === 'Approved' ? 'success' : 'error', 
                    3000
                );
            }
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-tasks mr-3 text-red-600"></i> Persetujuan Tugas Tim
            </h2>

            <GlassCard>
                {/* Filter */}
                <div className="flex justify-start mb-6 space-x-3">
                    <PrimaryButton 
                        onClick={() => setFilterStatus('Pending')}
                        className={filterStatus === 'Pending' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 hover:bg-gray-500'}
                    >
                        <i className="fas fa-hourglass-half mr-2"></i> Pending ({pendingTasks?.length || 0})
                    </PrimaryButton>
                    {/* Tambahkan tombol untuk melihat Approved/Rejected jika perlu */}
                </div>

                {/* Daftar Tugas */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {filteredTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Tidak ada tugas yang menunggu persetujuan.</p>
                    ) : (
                        filteredTasks.map(task => (
                            <div key={task.id} className="p-5 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{task.taskTitle}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        task.type === 'Submission' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {task.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Dari: <span className="font-medium text-gray-800">{task.employeeName} ({task.division})</span></p>
                                <p className="text-sm text-gray-500 italic mb-4">{task.description}</p>
                                
                                <div className="flex justify-between items-center border-t pt-3">
                                    <div className="text-xs text-gray-500">
                                        <i className="fas fa-calendar-alt mr-1"></i> Diajukan: {task.submittedAt}
                                        {task.attachment && (
                                            <p className="mt-1"><i className="fas fa-paperclip mr-1"></i> File: <span className="font-medium text-blue-600">{task.attachment.name} (Simulasi)</span></p>
                                        )}
                                    </div>
                                    <div className="flex space-x-3">
                                        <PrimaryButton 
                                            onClick={() => handleApproval(task.id, 'Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-sm py-2 px-3"
                                        >
                                            <i className="fas fa-check-circle mr-2"></i> Setuju
                                        </PrimaryButton>
                                        <PrimaryButton 
                                            onClick={() => handleApproval(task.id, 'Rejected')}
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

export default SupervisorTaskApproval;