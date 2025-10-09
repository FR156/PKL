// src/pages/SupervisorDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, TabButton, StatCard, PrimaryButton } from '../../components/componentsUtilityUI';
import { formattedCurrency, showSwal, COLORS } from '../../utils/constants';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import CameraModal from '../../components/CameraModal';
import { handleAttendanceClock } from '../../services/DataService';

// --- D1. Ringkasan Dashboard Supervisor ---
const SupervisorSummary = ({ employees, pendingTasks }) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const lateToday = employees.flatMap(e => e.currentMonthAttendance)
        .filter(a => a.type === 'Clock In' && a.late && a.date === new Date().toLocaleDateString('id-ID')).length;
    const pendingTasksCount = pendingTasks.length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Karyawan" value={totalEmployees} icon="fas fa-users" color="blue" />
            <StatCard title="Karyawan Aktif" value={activeEmployees} icon="fas fa-user-check" color="green" />
            <StatCard title="Tugas Pending" value={pendingTasksCount} icon="fas fa-tasks" color="yellow" />
            <StatCard title="Terlambat Hari Ini" value={`${lateToday} orang`} icon="fas fa-exclamation-triangle" color="red" />
        </div>
    );
};

// --- D2. Persetujuan Tugas Karyawan ---
const SupervisorTaskApproval = ({ employees, setEmployees, pendingTasks, setPendingTasks }) => {
    const handleApproval = (id, status) => {
        const task = pendingTasks.find(t => t.id === id);
        if (!task) return;

        // Update the task status
        const updatedTasks = pendingTasks.map(t => 
            t.id === id ? { ...t, status, approvedBy: 'Supervisor', approvedDate: new Date().toISOString() } : t
        );
        setPendingTasks(updatedTasks);

        // Add task to employee's tasks
        if (status === 'Approved') {
            setEmployees(prevEmployees =>
                prevEmployees.map(emp => {
                    if (emp.id === task.employeeId) {
                        const existingTasks = emp.tasks || [];
                        return {
                            ...emp,
                            tasks: [...existingTasks, { ...task, status: 'In Progress' }]
                        };
                    }
                    return emp;
                })
            );
            showSwal('Disetujui!', `Tugas "${task.title}" disetujui.`, 'success', 2000);
        } else {
            showSwal('Ditolak', `Tugas "${task.title}" ditolak.`, 'error', 2000);
        }
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Persetujuan Tugas</h3>

            <div className="space-y-4">
                {pendingTasks.length > 0 ? pendingTasks.map(task => (
                    <div key={task.id} className="p-4 rounded-lg shadow-sm border border-yellow-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-2 md:mb-0">
                            <p className="font-bold text-gray-800">{task.title}</p>
                            <p className="text-sm text-gray-600">Dari: {task.assignedBy} • Untuk: {task.employeeName}</p>
                            <p className="text-xs text-gray-500 italic">Deskripsi: {task.description}</p>
                            <p className="text-xs text-gray-500">Deadline: {task.deadline}</p>
                            {task.file && (
                                <p className="text-xs text-blue-600 mt-1">
                                    <i className="fas fa-paperclip mr-1"></i>
                                    {task.file.name}
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <PrimaryButton onClick={() => handleApproval(task.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-sm py-1 px-3">
                                <i className="fas fa-check"></i> Setuju
                            </PrimaryButton>
                            <PrimaryButton onClick={() => handleApproval(task.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">
                                <i className="fas fa-times"></i> Tolak
                            </PrimaryButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-8">Tidak ada tugas yang menunggu persetujuan.</p>
                )}
            </div>
        </GlassCard>
    );
};

// --- D3. Persetujuan Absensi ---
const SupervisorAttendanceApproval = ({ employees, setEmployees, pendingAttendance }) => {
    const handleApproval = (id, status) => {
        const attendance = pendingAttendance.find(a => a.id === id);
        if (!attendance) return;

        // Update the attendance status
        const updatedAttendance = pendingAttendance.map(a => 
            a.id === id ? { ...a, status, approvedBy: 'Supervisor', approvedDate: new Date().toISOString() } : a
        );
        setPendingAttendance(updatedAttendance);

        if (status === 'Approved') {
            // Add attendance to employee's records
            setEmployees(prevEmployees =>
                prevEmployees.map(emp => {
                    if (emp.id === attendance.employeeId) {
                        const existingAttendance = emp.currentMonthAttendance || [];
                        return {
                            ...emp,
                            currentMonthAttendance: [...existingAttendance, { ...attendance, status: 'Approved' }]
                        };
                    }
                    return emp;
                })
            );
            showSwal('Disetujui!', `Absensi ${attendance.employeeName} disetujui.`, 'success', 2000);
        } else {
            showSwal('Ditolak', `Absensi ${attendance.employeeName} ditolak.`, 'error', 2000);
        }
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Persetujuan Absensi</h3>

            <div className="space-y-4">
                {pendingAttendance.length > 0 ? pendingAttendance.map(attendance => (
                    <div key={attendance.id} className="p-4 rounded-lg shadow-sm border border-yellow-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-2 md:mb-0">
                            <p className="font-bold text-gray-800">{attendance.employeeName} - {attendance.type}</p>
                            <p className="text-sm text-gray-600">Waktu: {attendance.time} • Tanggal: {attendance.date}</p>
                            <p className="text-sm text-gray-600">Lokasi: {attendance.location}</p>
                            {attendance.late && <p className="text-xs text-red-500">Terlambat</p>}
                            {attendance.reason && <p className="text-xs text-gray-500">Alasan: {attendance.reason}</p>}
                        </div>
                        <div className="flex space-x-2">
                            <PrimaryButton onClick={() => handleApproval(attendance.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-sm py-1 px-3">
                                <i className="fas fa-check"></i> Setuju
                            </PrimaryButton>
                            <PrimaryButton onClick={() => handleApproval(attendance.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">
                                <i className="fas fa-times"></i> Tolak
                            </PrimaryButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-8">Tidak ada absensi yang menunggu persetujuan.</p>
                )}
            </div>
        </GlassCard>
    );
};

// --- D4. Laporan Performa Karyawan ---
const SupervisorPerformanceReport = ({ employees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.division.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Calculate performance score for each employee
    const employeesWithPerformance = filteredEmployees.map(emp => {
        // Get attendance data
        const attendanceRecords = emp.currentMonthAttendance || [];
        const totalDays = new Date().getDate(); // Current day of month
        const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
        const attendanceScore = (presentDays / totalDays) * 50; // 50% of score from attendance
        
        // Get tasks data
        const tasks = emp.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalTasks = tasks.length || 1; // Avoid division by zero
        const taskScore = (completedTasks / totalTasks) * 50; // 50% of score from tasks
        
        const performanceScore = Math.round(attendanceScore + taskScore);
        
        return {
            ...emp,
            performanceScore
        };
    }).sort((a, b) => b.performanceScore - a.performanceScore); // Sort by performance score (highest first)
    
   const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Laporan Performa Karyawan', 14, 15);

    const tableData = employeesWithPerformance.map(emp => {
        const attendanceRecords = emp.currentMonthAttendance || [];
        const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
        const totalDays = new Date().getDate();
        const attendancePercentage = Math.round((presentDays / totalDays) * 100);

        const tasks = emp.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalTasks = tasks.length || 1;
        const taskPercentage = Math.round((completedTasks / totalTasks) * 100);

        return [
            emp.name,
            emp.division,
            `${attendancePercentage}%`,
            `${taskPercentage}%`,
            `${emp.performanceScore}/100`
        ];
    });

    autoTable(doc, { // <- ini penting, bukan doc.autoTable()
        head: [['Nama', 'Divisi', 'Kehadiran', 'Tugas', 'Skor Performa']],
        body: tableData,
        startY: 25,
    });

    doc.save('laporan_performa_karyawan.pdf');
};
    const exportToExcel = () => {
        const data = employeesWithPerformance.map(emp => {
            const attendanceRecords = emp.currentMonthAttendance || [];
            const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
            const totalDays = new Date().getDate();
            const attendancePercentage = Math.round((presentDays / totalDays) * 100);
            
            const tasks = emp.tasks || [];
            const completedTasks = tasks.filter(t => t.status === 'Completed').length;
            const totalTasks = tasks.length || 1;
            const taskPercentage = Math.round((completedTasks / totalTasks) * 100);
            
            return {
                'Nama': emp.name,
                'Divisi': emp.division,
                'Kehadiran': `${attendancePercentage}%`,
                'Tugas': `${taskPercentage}%`,
                'Skor Performa': `${emp.performanceScore}/100`
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Performa');
        XLSX.writeFile(wb, 'laporan_performa_karyawan.xlsx');
    };

    return (
        <>
            <GlassCard className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Laporan Performa Karyawan</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={exportToPDF}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                        >
                            <i className="fas fa-file-pdf mr-2"></i>
                            Export PDF
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                        >
                            <i className="fas fa-file-excel mr-2"></i>
                            Export Excel
                        </button>
                    </div>
                </div>
                
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama atau divisi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kehadiran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tugas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Performa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employeesWithPerformance.map(emp => {
                                const attendanceRecords = emp.currentMonthAttendance || [];
                                const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
                                const totalDays = new Date().getDate();
                                const attendancePercentage = Math.round((presentDays / totalDays) * 100);
                                
                                const tasks = emp.tasks || [];
                                const completedTasks = tasks.filter(t => t.status === 'Completed').length;
                                const totalTasks = tasks.length || 1;
                                const taskPercentage = Math.round((completedTasks / totalTasks) * 100);
                                
                                return (
                                    <tr key={emp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.division}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${attendancePercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-500">{attendancePercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full" 
                                                        style={{ width: `${taskPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-500">{taskPercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                emp.performanceScore >= 80 ? 'bg-green-100 text-green-800' : 
                                                emp.performanceScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {emp.performanceScore}/100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <PrimaryButton 
                                                onClick={() => setSelectedEmployee(emp)} 
                                                className="bg-blue-500 hover:bg-blue-600 py-1 px-2"
                                            >
                                                <i className="fas fa-eye"></i> Detail
                                            </PrimaryButton>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Employee Detail Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <GlassCard className="w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold">Detail Performa: {selectedEmployee.name}</h4>
                            <button onClick={() => setSelectedEmployee(null)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h5 className="font-semibold text-lg mb-2">Informasi Karyawan</h5>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Nama:</span> {selectedEmployee.name}</p>
                                    <p><span className="font-medium">Divisi:</span> {selectedEmployee.division}</p>
                                    <p><span className="font-medium">Email:</span> {selectedEmployee.email}</p>
                                    <p><span className="font-medium">NIK:</span> {selectedEmployee.nik}</p>
                                </div>
                            </div>
                            <div>
                                <h5 className="font-semibold text-lg mb-2">Skor Performa</h5>
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${
                                        selectedEmployee.performanceScore >= 80 ? 'text-green-600' : 
                                        selectedEmployee.performanceScore >= 60 ? 'text-yellow-600' : 
                                        'text-red-600'
                                    }`}>
                                        {selectedEmployee.performanceScore}/100
                                    </div>
                                    <p className="text-gray-600 mt-2">
                                        {selectedEmployee.performanceScore >= 80 ? 'Sangat Baik' : 
                                         selectedEmployee.performanceScore >= 60 ? 'Cukup Baik' : 
                                         'Perlu Peningkatan'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h5 className="font-semibold text-lg mb-2">Detail Kehadiran</h5>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedEmployee.currentMonthAttendance.map(record => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className={`font-semibold ${record.type === 'Clock In' ? 'text-green-600' : 'text-red-600'}`}>{record.type}</span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{record.time}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className={`text-xs ${record.late ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                        {record.late ? 'Terlambat' : 'Tepat Waktu'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div>
                            <h5 className="font-semibold text-lg mb-2">Detail Tugas</h5>
                            <div className="space-y-2">
                                {selectedEmployee.tasks && selectedEmployee.tasks.length > 0 ? (
                                    selectedEmployee.tasks.map(task => (
                                        <div key={task.id} className={`p-3 rounded-lg border-l-4 ${
                                            task.status === 'Completed' ? 'bg-green-50 border-green-500' : 
                                            task.status === 'In Progress' ? 'bg-blue-50 border-blue-500' : 
                                            'bg-yellow-50 border-yellow-500'
                                        }`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-medium">{task.title}</h6>
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                                        <i className="fas fa-calendar-alt mr-1"></i>
                                                        <span>Deadline: {task.deadline}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Belum ada tugas untuk karyawan ini.</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </>
    );
};
// --- D5. supervisorAttendance ---
const SupervisorAttendance = ({ user, employees, setEmployees, workSettings }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [lateReason, setLateReason] = useState('');
    const [earlyLeaveReason, setEarlyLeaveReason] = useState('');
    const [showLateReasonModal, setShowLateReasonModal] = useState(false);
    const [showEarlyLeaveModal, setShowEarlyLeaveModal] = useState(false);

    if (!user.currentMonthAttendance) user.currentMonthAttendance = [];

    const todayStr = new Date().toLocaleDateString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit' });
    const todayRecords = user.currentMonthAttendance.filter(r => r.date === todayStr);
    const hasClockIn = todayRecords.some(r => r.type === 'Clock In');
    const hasClockOut = todayRecords.some(r => r.type === 'Clock Out');
    const nextAction = hasClockIn && !hasClockOut ? 'Clock Out' : (!hasClockIn ? 'Clock In' : null);

    const currentTime = new Date();
    const workStartTime = new Date();
    workStartTime.setHours(workSettings.startTime.split(':')[0], workSettings.startTime.split(':')[1],0,0);
    const workEndTime = new Date();
    workEndTime.setHours(workSettings.endTime.split(':')[0], workSettings.endTime.split(':')[1],0,0);

    const isLate = currentTime > workStartTime && nextAction === 'Clock In';
    const isEarlyLeave = currentTime < workEndTime && nextAction === 'Clock Out';

    const processAttendance = (photoData, reason = '') => {
        const record = {
            id: Date.now(),
            date: todayStr,
            time: currentTime.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
            type: nextAction,
            location: 'Lat: -6.21, Lon: 106.84',
            photo: photoData || null,
            late: isLate && nextAction==='Clock In',
            earlyLeave: isEarlyLeave && nextAction==='Clock Out',
            reason: reason || '',
        };

        const updated = [...user.currentMonthAttendance, record];
        user.currentMonthAttendance = updated;

        setEmployees(prev => prev.map(e => e.id === user.id ? { ...e, currentMonthAttendance: updated } : e));
        localStorage.setItem(`attendance_${user.id}`, JSON.stringify(updated));
        showSwal('Absen Berhasil', `${nextAction} tersimpan!`, 'success', 2000);
        setIsCameraOpen(false);
        setLateReason('');
        setEarlyLeaveReason('');
        setShowLateReasonModal(false);
        setShowEarlyLeaveModal(false);
    };

    const onCapture = (photoData) => {
        if (isLate && nextAction==='Clock In') return setShowLateReasonModal(true);
        if (isEarlyLeave && nextAction==='Clock Out') return setShowEarlyLeaveModal(true);
        processAttendance(photoData);
    };

    const submitLateReason = () => {
        if (!lateReason.trim()) return showSwal('Error','Alasan keterlambatan harus diisi','error');
        const photoData = document.getElementById('camera-photo-data')?.value || null;
        processAttendance(photoData, lateReason);
    };

    const submitEarlyLeaveReason = () => {
        if (!earlyLeaveReason.trim()) return showSwal('Error','Alasan pulang lebih awal harus diisi','error');
        const photoData = document.getElementById('camera-photo-data')?.value || null;
        processAttendance(photoData, earlyLeaveReason);
    };

    return (
        <>
            <GlassCard>
                <h3 className="text-2xl font-bold mb-4">Absensi Saya</h3>
                <PrimaryButton onClick={() => setIsCameraOpen(true)} disabled={!nextAction}>
                    {nextAction ? nextAction + ' Sekarang' : 'Hari Ini Selesai'}
                </PrimaryButton>

                <h4 className="mt-6 mb-2 font-bold">Riwayat Absensi Bulan Ini</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th>Tanggal</th><th>Tipe</th><th>Waktu</th><th>Status</th><th>Alasan</th><th>Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.currentMonthAttendance.length > 0 ? user.currentMonthAttendance.map(r => (
                                <tr key={r.id}>
                                    <td>{r.date}</td>
                                    <td>{r.type}</td>
                                    <td>{r.time}</td>
                                    <td>{r.late ? 'Terlambat' : r.earlyLeave ? 'Pulang Cepat' : 'Tepat Waktu'}</td>
                                    <td>{r.reason || '-'}</td>
                                    <td>
                                        {r.photo ? (
                                            <img src={r.photo} className="w-16 h-16 rounded" />
                                        ) : <span className="text-gray-400">Belum ada foto</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center">Belum ada absensi bulan ini</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <CameraModal isOpen={isCameraOpen} onClose={()=>setIsCameraOpen(false)} onCapture={onCapture} user={user} title={`Ambil Foto untuk ${nextAction}`} />
            </GlassCard>

            {/* Late Reason Modal */}
            {showLateReasonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <GlassCard className="w-full max-w-md p-4">
                        <h4 className="text-xl font-bold mb-2">Alasan Keterlambatan</h4>
                        <textarea value={lateReason} onChange={e=>setLateReason(e.target.value)} className="w-full p-2 border rounded" rows="4"/>
                        <div className="flex justify-end mt-4 space-x-2">
                            <PrimaryButton onClick={()=>setShowLateReasonModal(false)}>Batal</PrimaryButton>
                            <PrimaryButton onClick={submitLateReason}>Kirim</PrimaryButton>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Early Leave Modal */}
            {showEarlyLeaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <GlassCard className="w-full max-w-md p-4">
                        <h4 className="text-xl font-bold mb-2">Alasan Pulang Lebih Awal</h4>
                        <textarea value={earlyLeaveReason} onChange={e=>setEarlyLeaveReason(e.target.value)} className="w-full p-2 border rounded" rows="4"/>
                        <div className="flex justify-end mt-4 space-x-2">
                            <PrimaryButton onClick={()=>setShowEarlyLeaveModal(false)}>Batal</PrimaryButton>
                            <PrimaryButton onClick={submitEarlyLeaveReason}>Kirim</PrimaryButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </>
    );
};


// --- D6. Supervisor Profile ---
const SupervisorProfile = ({ user, employees, setEmployees, setAuthUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [profileImage, setProfileImage] = useState(user.profileImage || null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Update supervisor data
        const updatedSupervisor = {
            ...formData,
            profileImage
        };

        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === user.id ? updatedSupervisor : emp
            )
        );
        setAuthUser(updatedSupervisor);
        setIsEditing(false);
        showSwal('Sukses!', 'Data profil berhasil diperbarui.', 'success', 2000);
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex justify-between items-center">
                Profil Saya
                <PrimaryButton onClick={() => setIsEditing(!isEditing)} className="text-sm px-3 py-1">
                    <i className={`fas fa-${isEditing ? 'times' : 'edit'} mr-2`}></i>
                    {isEditing ? 'Batal' : 'Edit Profil'}
                </PrimaryButton>
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={profileImage || 'https://picsum.photos/seed/supervisor/200/200.jpg'}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                        />
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2"
                            >
                                <i className="fas fa-camera text-xs"></i>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/jpeg, image/jpg, image/png"
                            className="hidden"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Foto Profil</p>
                </div>

                <div className="flex-grow space-y-3">
                    <div className="flex items-center">
                        <i className="fas fa-id-card text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">NIK:</span>
                        {isEditing ? <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.nik}</span>}
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-user-circle text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Nama:</span>
                        {isEditing ? <input type="text" name="name" value={formData.name} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.name}</span>}
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-envelope text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Email:</span>
                        {isEditing ? <input type="email" name="email" value={formData.email} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.email}</span>}
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-phone text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Telepon:</span>
                        {isEditing ? <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.phone}</span>}
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-map-marker-alt text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Alamat:</span>
                        {isEditing ? <input type="text" name="address" value={formData.address} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.address}</span>}
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4">
                    <PrimaryButton onClick={handleSave} className="w-full">
                        Simpan Perubahan
                    </PrimaryButton>
                </div>
            )}
        </GlassCard>
    );
};

// --- SUPERVISOR DASHBOARD WRAPPER ---
const SupervisorDashboard = (props) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [pendingTasks, setPendingTasks] = useState([]);
    const [pendingAttendance, setPendingAttendance] = useState([]);

    // Initialize data from localStorage
    useEffect(() => {
        const storedPendingTasks = localStorage.getItem('pendingTasks');
        const storedPendingAttendance = localStorage.getItem('pendingAttendance');
        
        if (storedPendingTasks) {
            setPendingTasks(JSON.parse(storedPendingTasks));
        }
        
        if (storedPendingAttendance) {
            setPendingAttendance(JSON.parse(storedPendingAttendance));
        }
    }, []);

    // Save data to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
    }, [pendingTasks]);

    useEffect(() => {
        localStorage.setItem('pendingAttendance', JSON.stringify(pendingAttendance));
    }, [pendingAttendance]);

    return (
        <div className="py-4">
            {/* Header Tab */}
            <div className="flex space-x-3 overflow-x-auto mb-6 pb-2">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-tachometer-alt mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'taskApproval'} onClick={() => setActiveTab('taskApproval')}>
                    <i className="fas fa-tasks mr-2"></i> Persetujuan Tugas
                </TabButton>
                <TabButton isActive={activeTab === 'attendanceApproval'} onClick={() => setActiveTab('attendanceApproval')}>
                    <i className="fas fa-user-check mr-2"></i> Persetujuan Absensi
                </TabButton>
                <TabButton isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                    <i className="fas fa-chart-line mr-2"></i> Performa Karyawan
                </TabButton>
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-clock mr-2"></i> Absensi Saya
                </TabButton>
                <TabButton isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <i className="fas fa-user mr-2"></i> Profil
                </TabButton>
            </div>

            {/* Content */}
            {activeTab === 'summary' && <SupervisorSummary {...props} pendingTasks={pendingTasks} />}
            {activeTab === 'taskApproval' && <SupervisorTaskApproval {...props} pendingTasks={pendingTasks} setPendingTasks={setPendingTasks} />}
            {activeTab === 'attendanceApproval' && <SupervisorAttendanceApproval {...props} pendingAttendance={pendingAttendance} setPendingAttendance={setPendingAttendance} />}
            {activeTab === 'performance' && <SupervisorPerformanceReport {...props} />}
            {activeTab === 'attendance' && <SupervisorAttendance {...props} />}
            {activeTab === 'profile' && <SupervisorProfile {...props} />}
        </div>
    );
};

export default SupervisorDashboard;