// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, TabButton, StatCard, PrimaryButton, Cell } from '../../components/componentsUtilityUI';
import { formattedCurrency, COLORS, DUMMY_MANAGER_REPORTS, showSwal } from '../../utils/constants';

import {
    PieChart,
    Pie,
    Cell as PieCell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart, // Mungkin masih digunakan di tempat lain, tapi kita ganti di ManagerPayrollReport
    XAxis,
    YAxis,
    CartesianGrid,
    Bar, // Mungkin masih digunakan di tempat lain
    LineChart, // ✨ Tambahkan ini
    Line, // ✨ Tambahkan ini
    ReferenceLine // ✨ Tambahkan ini (opsional, untuk garis referensi)
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import CameraModal from '../../components/CameraModal';
import { handleAttendanceClock } from '../../services/DataService';

// --- B1. Ringkasan Dashboard Manager ---
const ManagerSummary = ({ employees, pendingLeave, user }) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const lateToday = employees.flatMap(e => e.currentMonthAttendance)
        .filter(a => a.type === 'Clock In' && a.late && a.date === new Date().toLocaleDateString('id-ID')).length;
    const pendingCount = pendingLeave.length;

    const dataPie = [
        { name: 'Active', value: activeEmployees, color: COLORS.Success },
        { name: 'Inactive', value: totalEmployees - activeEmployees, color: COLORS.Error },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Karyawan" value={totalEmployees} icon="fas fa-users" color="blue" />
            <StatCard title="Cuti Pending" value={`${pendingCount} permintaan`} icon="fas fa-hourglass-half" color="yellow" />
            <StatCard title="Terlambat Hari Ini" value={`${lateToday} orang`} icon="fas fa-exclamation-triangle" color="red" />

            {/* Chart Status Karyawan */}
            <GlassCard className="lg:col-span-2">
                <h4 className="text-xl font-bold mb-4">Status Karyawan</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dataPie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {dataPie.map((entry, index) => (
                                <PieCell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} orang`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Aktivitas Terkini (Dummy) */}
            <GlassCard>
                <h4 className="text-xl font-bold mb-4">Aktivitas Absensi Terkini</h4>
                <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b pb-2">
                        <span>Djob Misael (Tech)</span> 
                        <span className="text-green-600 font-medium">Clock In 07:55</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                        <span>Adi Pratama (Tech)</span> 
                        <span className="text-red-600 font-medium">Clock In 08:01</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                        <span>Djob Misael (Tech)</span> 
                        <span className="text-red-600 font-medium">Clock Out 17:05</span>
                    </li>
                </ul>
            </GlassCard>
        </div>
    );
};

// --- B2. Persetujuan Cuti Manajer ---
const ManagerLeaveApproval = ({ employees, setEmployees, pendingLeave, setPendingLeave }) => {
    const handleApproval = (id, status) => {
        const request = pendingLeave.find(req => req.id === id);
        if (!request) return;

        // Update the request status
        const updatedRequests = pendingLeave.map(req => 
            req.id === id ? { ...req, status, approvedBy: 'Manager', approvedDate: new Date().toISOString() } : req
        );
        setPendingLeave(updatedRequests);

        if (status === 'Approved') {
            showSwal('Disetujui!', `Cuti ${request.name} disetujui.`, 'success', 2000);
        } else {
            if (request.type === 'Cuti Tahunan') {
                setEmployees(prev => prev.map(emp =>
                    emp.id === request.employeeId ? { ...emp, cutiBalance: emp.cutiBalance + request.days } : emp
                ));
            }
            showSwal('Ditolak', `Cuti ${request.name} ditolak.`, 'error', 2000);
        }
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Persetujuan Cuti</h3>

            <div className="space-y-4">
                {pendingLeave.length > 0 ? pendingLeave.map(request => (
                    <div key={request.id} className="p-4 rounded-lg shadow-sm border border-yellow-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-2 md:mb-0">
                            <p className="font-bold text-gray-800">{request.name} - {request.type}</p>
                            <p className="text-sm text-gray-600">{request.startDate} s/d {request.endDate} ({request.days} hari)</p>
                            <p className="text-xs text-gray-500 italic">Alasan: {request.reason}</p>
                            {request.medicalCertificate && (
                                <p className="text-xs text-blue-600 mt-1">
                                    <i className="fas fa-file-medical mr-1"></i>
                                    {request.medicalCertificate.name}
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <PrimaryButton onClick={() => handleApproval(request.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-sm py-1 px-3">
                                <i className="fas fa-check"></i> Setuju
                            </PrimaryButton>
                            <PrimaryButton onClick={() => handleApproval(request.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">
                                <i className="fas fa-times"></i> Tolak
                            </PrimaryButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-8">Tidak ada permintaan cuti yang menunggu persetujuan.</p>
                )}
            </div>
        </GlassCard>
    );
};

// --- B3. Laporan Gaji Bulanan Manajer ---
// --- B3. Laporan Gaji Bulanan Manajer ---
const ManagerPayrollReport = ({ employees }) => {
    // Kita perlu memodifikasi dataBar agar memiliki data Gaji Pokok (basicSalary)
    // untuk garis perbandingan. DUMMY_MANAGER_REPORTS aslinya hanya punya 'totalSalary'.
    // Saya asumsikan dataBar sekarang memiliki struktur:
    // [{ name: 'Jan', totalSalary: X, basicSalary: Y }, ...]
    const dataBar = DUMMY_MANAGER_REPORTS.map(d => ({
        ...d,
        // Ini adalah simulasi data basic salary untuk garis kedua
        basicSalary: d.totalSalary * 0.7 
    }));

    const calculateTotalSalary = (details) => {
        return details.basic + details.allowance + (details.overtimeHours * details.overtimeRate) + details.bonus - details.deductions;
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Create a title
        doc.setFontSize(16);
        doc.text('Laporan Gaji Bulanan', 14, 15);
        
        // Create table data
        const tableData = employees.map(emp => {
            const details = emp.salaryDetails;
            const totalSalary = calculateTotalSalary(details);
            return [
                emp.name,
                emp.division,
                formattedCurrency(details.basic),
                formattedCurrency(details.allowance),
                formattedCurrency(details.overtimeHours * details.overtimeRate),
                formattedCurrency(details.bonus),
                formattedCurrency(details.deductions),
                formattedCurrency(totalSalary)
            ];
        });
        
        // Create table
        doc.autoTable({
            head: [['Nama', 'Divisi', 'Gaji Pokok', 'Tunjangan', 'Lembur', 'Bonus', 'Potongan', 'Total']],
            body: tableData,
            startY: 25,
        });
        
        doc.save('laporan_gaji.pdf');
    };

    const exportToExcel = () => {
        const data = employees.map(emp => {
            const details = emp.salaryDetails;
            const totalSalary = calculateTotalSalary(details);
            return {
                'Nama': emp.name,
                'Divisi': emp.divisi,
                'Gaji Pokok': details.basic,
                'Tunjangan': details.allowance,
                'Lembur': details.overtimeHours * details.overtimeRate,
                'Bonus': details.bonus,
                'Potongan': details.deductions,
                'Total Gaji': totalSalary
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Gaji');
        XLSX.writeFile(wb, 'laporan_gaji.xlsx');
    };

    return (
        <GlassCard className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Laporan Gaji Bulanan</h3>
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
            <p className="text-gray-600 mb-6">Total pengeluaran gaji perusahaan per bulan. Garis abu-abu putus-putus menunjukkan Gaji Pokok (Simulasi).</p>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dataBar} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.Light} vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke={COLORS.Secondary} 
                        tickLine={false}
                        padding={{ left: 20, right: 20 }}
                    />
                    <YAxis 
                        tickFormatter={(value) => formattedCurrency(value)} 
                        stroke={COLORS.Secondary} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        formatter={(value, name) => [formattedCurrency(value), name]}
                        labelFormatter={(label) => `Bulan: ${label}`}
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: `1px solid ${COLORS.Primary}`, 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    
                    {/* --- DEFINISI GRADIENT (Untuk area fill Total Gaji) --- */}
                    <defs>
                        <linearGradient id="colorTotalSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.Primary} stopOpacity={0.7}/>
                            <stop offset="95%" stopColor={COLORS.Primary} stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    {/* 1. Garis Total Gaji (Garis Utama dengan Area Fill) */}
                    <Line 
                        type="monotone"
                        dataKey="totalSalary" 
                        stroke={COLORS.Primary} 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, fill: COLORS.Light, stroke: COLORS.Primary, strokeWidth: 2 }}
                        name="Total Gaji (Kotor)"
                    />
                    
                    {/* Area fill menggunakan gradient */}
                    <Line 
                        type="monotone"
                        dataKey="totalSalary"
                        stroke="none"
                        fill="url(#colorTotalSalary)" 
                    />

                    {/* 2. Garis Gaji Pokok (Garis Pembanding, Dashed) */}
                    <Line 
                        type="monotone"
                        dataKey="basicSalary" 
                        stroke={COLORS.Secondary}
                        strokeDasharray="5 5"
                        strokeWidth={1.5} 
                        dot={false}
                        activeDot={{ r: 5, fill: 'white', stroke: COLORS.Secondary, strokeWidth: 2 }}
                        name="Gaji Pokok (Simulasi)" 
                    />
                    
                </LineChart>
            </ResponsiveContainer>
        </GlassCard>
    );
};

// --- B4. Manajemen Karyawan (Tambah/Edit) ---
const ManagerEmployeeManagement = ({ employees, setEmployees }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.division.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        if (data.id) {
            setEmployees(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
            showSwal('Berhasil!', 'Data karyawan berhasil diperbarui.', 'success', 2000);
        } else {
            const newId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            const newEmp = { 
                ...data, 
                id: newId, 
                status: 'Active', 
                currentMonthAttendance: [], 
                attendancePhotos: [],
                salaryDetails: { 
                    basic: 5000000, 
                    allowance: 1000000, 
                    overtimeHours: 0, 
                    overtimeRate: 50000, 
                    bonus: 0, 
                    deductions: 0 
                },
                cutiBalance: 12,
                joinDate: new Date().toISOString().split('T')[0]
            };
            setEmployees(prev => [...prev, newEmp]);
            showSwal('Berhasil!', 'Karyawan baru berhasil ditambahkan.', 'success', 2000);
        }
        setIsModalOpen(false);
        setCurrentEmployee(null);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Yakin ingin menghapus karyawan ${name}?`)) {
            setEmployees(prev => prev.filter(e => e.id !== id));
            showSwal('Dihapus!', `Karyawan ${name} telah dihapus.`, 'warning', 2000);
        }
    };

    const EmployeeModal = ({ isOpen, onClose, employeeData, onSave }) => {
        if (!isOpen) return null;
        const [data, setData] = useState(employeeData || { 
            name: '', 
            division: '', 
            email: '', 
            phone: '', 
            nik: '',
            address: ''
        });
        const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
        const handleSubmit = (e) => { e.preventDefault(); onSave(data); };

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <GlassCard className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <h4 className="text-xl font-bold mb-4">{employeeData ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input type="text" name="name" placeholder="Nama" value={data.name} onChange={handleChange} required className="w-full p-2 border rounded" />
                        <input type="text" name="nik" placeholder="NIK" value={data.nik} onChange={handleChange} required className="w-full p-2 border rounded" />
                        <input type="text" name="division" placeholder="Divisi" value={data.division} onChange={handleChange} required className="w-full p-2 border rounded" />
                        <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleChange} required className="w-full p-2 border rounded" />
                        <input type="text" name="phone" placeholder="No. HP" value={data.phone} onChange={handleChange} className="w-full p-2 border rounded" />
                        <input type="text" name="address" placeholder="Alamat" value={data.address} onChange={handleChange} className="w-full p-2 border rounded" />

                        <div className="flex justify-end space-x-2 pt-2">
                            <PrimaryButton type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600">Batal</PrimaryButton>
                            <PrimaryButton type="submit">Simpan</PrimaryButton>
                        </div>
                    </form>
                </GlassCard>
            </div>
        );
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Karyawan</h3>

            <div className="flex justify-between items-center mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Cari nama atau divisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border rounded-lg"
                />
                <PrimaryButton onClick={() => setIsModalOpen(true)}>
                    <i className="fas fa-plus"></i> Tambah Karyawan
                </PrimaryButton>
            </div>

            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.nik}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.division}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <PrimaryButton onClick={() => { setCurrentEmployee(emp); setIsModalOpen(true); }} className="bg-yellow-500 hover:bg-yellow-600 py-1 px-2">Edit</PrimaryButton>
                                    <PrimaryButton onClick={() => handleDelete(emp.id, emp.name)} className="bg-red-500 hover:bg-red-600 py-1 px-2">Hapus</PrimaryButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EmployeeModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCurrentEmployee(null); }}
                employeeData={currentEmployee}
                onSave={handleSave}
            />
        </GlassCard>
    );
};

// --- B5. Laporan Selfie Absensi Manager ---
const ManagerAttendanceReport = ({ employees }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const allPhotos = employees.flatMap(emp => emp.attendancePhotos);

    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
    };

    const closeModal = () => {
        setSelectedPhoto(null);
    };

    return (
        <>
            <GlassCard className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Laporan Kehadiran Foto Selfie</h3>
                <p className="text-gray-600 mb-4">Foto absensi terbaru dari seluruh karyawan.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
                    {allPhotos
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 50)
                        .map(photo => (
                            <div 
                                key={photo.id} 
                                className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer"
                                onClick={() => handlePhotoClick(photo)}
                            >
                                <img src={photo.photo} alt={`${photo.employeeName} ${photo.type}`} className="w-full h-32 object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-semibold">{photo.employeeName}</p>
                                    <p className="text-green-300 text-xs">{photo.type} {photo.time}</p>
                                    <p className="text-gray-400 text-xs truncate" title={photo.location}>{photo.location}</p>
                                </div>
                            </div>
                        ))}
                </div>
                {allPhotos.length === 0 && <p className="text-center py-8 text-gray-500">Belum ada data foto absensi.</p>}
            </GlassCard>

            {/* Photo Detail Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={closeModal}>
                    <GlassCard className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold">Detail Absensi</h4>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <img src={selectedPhoto.photo} alt={`${selectedPhoto.employeeName} ${selectedPhoto.type}`} className="w-full rounded-lg" />
                            </div>
                            <div>
                                <h5 className="font-semibold text-lg mb-2">Informasi Karyawan</h5>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Nama:</span> {selectedPhoto.employeeName}</p>
                                    <p><span className="font-medium">Divisi:</span> {selectedPhoto.division}</p>
                                    <p><span className="font-medium">Email:</span> {selectedPhoto.email}</p>
                                    <p><span className="font-medium">NIK:</span> {selectedPhoto.nik}</p>
                                </div>
                                <h5 className="font-semibold text-lg mt-4 mb-2">Informasi Absensi</h5>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Tipe:</span> {selectedPhoto.type}</p>
                                    <p><span className="font-medium">Waktu:</span> {selectedPhoto.time}</p>
                                    <p><span className="font-medium">Tanggal:</span> {selectedPhoto.date}</p>
                                    <p><span className="font-medium">Lokasi:</span> {selectedPhoto.location}</p>
                                    {selectedPhoto.late && <p className="text-red-500"><span className="font-medium">Status:</span> Terlambat</p>}
                                    {selectedPhoto.reason && <p><span className="font-medium">Alasan:</span> {selectedPhoto.reason}</p>}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </>
    );
};

// --- B6. Manager Attendance ---
const ManagerAttendance = ({ user, managers, setManagers, workSettings }) => {
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

        if (setManagers) {
            setManagers(prev => prev.map(m => m.id === user.id ? { ...m, currentMonthAttendance: updated } : m));
        }

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
// --- B8. Profile Change Approval ---
const ManagerProfileApproval = ({ pendingProfileChanges, setPendingProfileChanges, employees, setEmployees }) => {
    const handleApproval = (id, status) => {
        const request = pendingProfileChanges.find(req => req.id === id);
        if (!request) return;

        // Update the request status
        const updatedRequests = pendingProfileChanges.map(req => 
            req.id === id ? { ...req, status, approvedBy: 'Manager', approvedDate: new Date().toISOString() } : req
        );
        setPendingProfileChanges(updatedRequests);

        if (status === 'Approved') {
            // Apply the changes to the employee
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp.id === request.employeeId ? { ...emp, ...request.changes } : emp
                )
            );
            showSwal('Disetujui!', `Perubahan profil ${request.employeeName} disetujui.`, 'success', 2000);
        } else {
            showSwal('Ditolak', `Perubahan profil ${request.employeeName} ditolak.`, 'error', 2000);
        }
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Persetujuan Perubahan Profil</h3>

            <div className="space-y-4">
                {pendingProfileChanges.length > 0 ? pendingProfileChanges.map(request => (
                    <div key={request.id} className="p-4 rounded-lg shadow-sm border border-yellow-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-2 md:mb-0">
                            <p className="font-bold text-gray-800">{request.employeeName}</p>
                            <p className="text-sm text-gray-600">Diajukan pada: {new Date(request.requestDate).toLocaleDateString('id-ID')}</p>
                            <p className="text-xs text-gray-500 italic">Perubahan: Nama, Email, Telepon, dll.</p>
                        </div>
                        <div className="flex space-x-2">
                            <PrimaryButton onClick={() => handleApproval(request.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-sm py-1 px-3">
                                <i className="fas fa-check"></i> Setuju
                            </PrimaryButton>
                            <PrimaryButton onClick={() => handleApproval(request.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">
                                <i className="fas fa-times"></i> Tolak
                            </PrimaryButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-8">Tidak ada permintaan perubahan profil yang menunggu persetujuan.</p>
                )}
            </div>
        </GlassCard>
    );
};

// --- MANAGER DASHBOARD WRAPPER ---
const ManagerProfile = ({ user }) => {
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Ardi Putra',
        email: user?.email || 'ardi@example.com',
        division: user?.division || 'Tech',
        phone: user?.phone || '08123456789',
        nik: user?.nik || '1234567890',
        address: user?.address || 'Jl. Contoh No.1'
    });

    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        showSwal('Berhasil!', 'Profil berhasil diperbarui.', 'success', 2000);
        setIsEditing(false);
        localStorage.setItem('dummyManagerProfile', JSON.stringify({ ...profileData, profileImage }));
    };

    return (
        <GlassCard className="p-4">
            <h3 className="text-2xl font-bold mb-4">Profil Saya</h3>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={profileImage || 'https://picsum.photos/seed/manager/200/200.jpg'}
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
                    {['name', 'email', 'division', 'phone', 'nik', 'address'].map(field => (
                        <div key={field}>
                            {isEditing ? (
                                <input
                                    type={field === 'email' ? 'email' : 'text'}
                                    name={field}
                                    value={profileData[field]}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                />
                            ) : (
                                <p><span className="font-semibold">{field === 'phone' ? 'No. HP' : field.charAt(0).toUpperCase() + field.slice(1)}:</span> {profileData[field]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {!isEditing ? (
                <PrimaryButton onClick={() => setIsEditing(true)} className="mt-2">
                    Edit Profil
                </PrimaryButton>
            ) : (
                <div className="flex space-x-2 mt-2">
                    <PrimaryButton onClick={handleSave} className="bg-green-500 hover:bg-green-600">Simpan</PrimaryButton>
                    <PrimaryButton onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">Batal</PrimaryButton>
                </div>
            )}
        </GlassCard>
    );
};
// --- MANAGER DASHBOARD UTAMA ---  
const ManagerDashboard = (props) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [pendingProfileChanges, setPendingProfileChanges] = useState([]);

    // Optional: ambil dari localStorage biar persistent
    useEffect(() => {
        const storedProfileChanges = localStorage.getItem('pendingProfileChanges');
        if (storedProfileChanges) {
            setPendingProfileChanges(JSON.parse(storedProfileChanges));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pendingProfileChanges', JSON.stringify(pendingProfileChanges));
    }, [pendingProfileChanges]);


    return (
        <div className="py-4">
            {/* Header Tab */}
            <div className="flex space-x-3 overflow-x-auto mb-6 pb-2">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-tachometer-alt mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'approval'} onClick={() => setActiveTab('approval')}>
                    <i className="fas fa-handshake mr-2"></i> Persetujuan Cuti
                </TabButton>
                <TabButton isActive={activeTab === 'profileApproval'} onClick={() => setActiveTab('profileApproval')}>
                    <i className="fas fa-user-check mr-2"></i> Persetujuan Profil
                </TabButton>
                <TabButton isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')}>
                    <i className="fas fa-file-invoice-dollar mr-2"></i> Laporan Gaji
                </TabButton>
                <TabButton isActive={activeTab === 'emp'} onClick={() => setActiveTab('emp')}>
                    <i className="fas fa-users mr-2"></i> Manajemen Karyawan
                </TabButton>
                <TabButton isActive={activeTab === 'report'} onClick={() => setActiveTab('report')}>
                    <i className="fas fa-camera mr-2"></i> Laporan Selfie
                </TabButton>
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-clock mr-2"></i> Absensi Saya
                </TabButton>
                <TabButton isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <i className="fas fa-user mr-2"></i> Profil
                </TabButton>
            </div>

            {/* Content */}
            {activeTab === 'summary' && <ManagerSummary {...props} />}
            {activeTab === 'approval' && <ManagerLeaveApproval {...props} />}
{activeTab === 'profileApproval' && (
    <ManagerProfileApproval
        {...props}
        pendingProfileChanges={pendingProfileChanges}
        setPendingProfileChanges={setPendingProfileChanges}
    />
)}
            {activeTab === 'payroll' && <ManagerPayrollReport {...props} />}
            {activeTab === 'emp' && <ManagerEmployeeManagement {...props} />}
            {activeTab === 'report' && <ManagerAttendanceReport {...props} />}
            {activeTab === 'attendance' && <ManagerAttendance {...props} />}
            {activeTab === 'profile' && <ManagerProfile {...props} />}
        </div>
    );
};

export default ManagerDashboard;