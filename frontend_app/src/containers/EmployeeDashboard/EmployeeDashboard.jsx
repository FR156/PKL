// src/containers/EmployeeDashboard/EmployeeDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PrimaryButton, GlassCard, StatCard, TabButton } from '../../components/componentsUtilityUI';
import CameraModal from '../../components/CameraModal';
import { handleAttendanceClock } from '../../services/DataService';
import { formattedCurrency, calculateTotalSalary, showSwal, COLORS } from '../../utils/constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Packer as DocxPacker } from 'docx';

// --- A1. Profil Karyawan & Update ---
const EmployeeProfile = ({ user, employees, setEmployees, setAuthUser, pendingProfileChanges, setPendingProfileChanges }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [profileImage, setProfileImage] = useState(user.profileImage || null);
    const [cvFile, setCvFile] = useState(user.cvFile || null);
    const [diplomaFile, setDiplomaFile] = useState(user.diplomaFile || null);
    const fileInputRef = useRef(null);
    const cvInputRef = useRef(null);
    const diplomaInputRef = useRef(null);

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

    const handleCvChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCvFile({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDiplomaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDiplomaFile({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Create a profile change request instead of directly updating
        const profileChangeRequest = {
            id: Date.now(),
            employeeId: user.id,
            employeeName: user.name,
            changes: {
                ...formData,
                profileImage,
                cvFile,
                diplomaFile
            },
            status: 'Pending',
            requestDate: new Date().toISOString()
        };

        setPendingProfileChanges(prev => [...prev, profileChangeRequest]);
        setIsEditing(false);
        showSwal('Berhasil!', 'Perubahan profil telah diajukan dan menunggu persetujuan manajer.', 'success', 3000);
    };

    // Check if there's a pending profile change
    const hasPendingChange = pendingProfileChanges.some(req => req.employeeId === user.id);

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex justify-between items-center">
                Profil Saya
                {hasPendingChange && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        <i className="fas fa-clock mr-1"></i> Menunggu Persetujuan
                    </span>
                )}
                <PrimaryButton onClick={() => setIsEditing(!isEditing)} className="text-sm px-3 py-1" disabled={hasPendingChange}>
                    <i className={`fas fa-${isEditing ? 'times' : 'edit'} mr-2`}></i>
                    {isEditing ? 'Batal' : 'Edit Profil'}
                </PrimaryButton>
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={profileImage || 'https://picsum.photos/seed/employee/200/200.jpg'}
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
                        <i className="fas fa-calendar-alt text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Divisi:</span>
                        <span>{user.division}</span>
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
                        <i className="fas fa-calendar-alt text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Tgl Gabung:</span>
                        <span>{user.joinDate}</span>
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-map-marker-alt text-xl text-blue-500 w-8"></i>
                        <span className="font-semibold mr-2">Alamat:</span>
                        {isEditing ? <input type="text" name="address" value={formData.address} onChange={handleChange} className="border rounded px-2 py-1 flex-grow" /> : <span>{user.address}</span>}
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-lg mb-3">Dokumen</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">CV</h5>
                                {isEditing && (
                                    <button
                                        onClick={() => cvInputRef.current.click()}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <i className="fas fa-upload"></i>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={cvInputRef}
                                    onChange={handleCvChange}
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                />
                            </div>
                            {cvFile ? (
                                <div className="flex items-center">
                                    <i className="fas fa-file-pdf text-red-500 mr-2"></i>
                                    <span className="text-sm truncate">{cvFile.name}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada CV</p>
                            )}
                        </div>
                        <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">Ijazah</h5>
                                {isEditing && (
                                    <button
                                        onClick={() => diplomaInputRef.current.click()}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <i className="fas fa-upload"></i>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={diplomaInputRef}
                                    onChange={handleDiplomaChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                            </div>
                            {diplomaFile ? (
                                <div className="flex items-center">
                                    <i className="fas fa-file-image text-green-500 mr-2"></i>
                                    <span className="text-sm truncate">{diplomaFile.name}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada ijazah</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4">
                    <PrimaryButton onClick={handleSave} className="w-full">
                        Ajukan Perubahan
                    </PrimaryButton>
                </div>
            )}
        </GlassCard>
    );
};

// --- A2. Absensi Clock In/Out ---
const EmployeeAttendance = ({ user, employees, setEmployees, workSettings }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [lateReason, setLateReason] = useState('');
    const [showLateReasonModal, setShowLateReasonModal] = useState(false);
    const [earlyLeaveReason, setEarlyLeaveReason] = useState('');
    const [showEarlyLeaveModal, setShowEarlyLeaveModal] = useState(false);
    
    // FIX DIBUAT DI SINI: Menyediakan nilai default jika workSettings adalah undefined/null
    const settings = workSettings || { startTime: '08:00', endTime: '17:00' };

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const todayRecords = user.currentMonthAttendance.filter(rec => rec.date === new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    const hasClockIn = todayRecords.some(rec => rec.type === 'Clock In');
    const hasClockOut = todayRecords.some(rec => rec.type === 'Clock Out');
    const actionType = hasClockIn ? 'Clock Out' : 'Clock In';
    
    // Check if current time is after work start time
    const currentTime = new Date();
    const workStartTime = new Date();
    // Menggunakan 'settings' yang sudah dijamin ada, bukan langsung 'workSettings'
    workStartTime.setHours(settings.startTime.split(':')[0], settings.startTime.split(':')[1], 0, 0);
    const isLate = currentTime > workStartTime && !hasClockIn;
    
    // Check if current time is before work end time
    const workEndTime = new Date();
    // Menggunakan 'settings'
    workEndTime.setHours(settings.endTime.split(':')[0], settings.endTime.split(':')[1], 0, 0);
    const isEarlyLeave = currentTime < workEndTime && hasClockIn;

    const onCapture = async (photoData) => {
        // Check if late and need reason
        if (isLate && actionType === 'Clock In') {
            setShowLateReasonModal(true);
            return;
        }
        
        // Check if early leave and need reason
        if (isEarlyLeave && actionType === 'Clock Out') {
            setShowEarlyLeaveModal(true);
            return;
        }
        
        processAttendance(photoData, actionType, '');
    };

    const processAttendance = async (photoData, actionType, reason) => {
        // Panggil service untuk menangani absensi
        const employeeData = employees.find(e => e.id === user.id);
        const result = await handleAttendanceClock(employeeData, photoData, actionType, reason);

        if (result.success) {
            const { newRecord, newPhotoRecord } = result;

            // safe call: jika setEmployees undefined, function no-op (di wrapper kita pastikan ada)
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp.id === user.id ? {
                        ...emp,
                        currentMonthAttendance: [...emp.currentMonthAttendance, newRecord],
                        attendancePhotos: [...emp.attendancePhotos, newPhotoRecord]
                    } : emp
                )
            );
            
            // Reset modals
            setShowLateReasonModal(false);
            setShowEarlyLeaveModal(false);
            setLateReason('');
            setEarlyLeaveReason('');
        }
    };

    const submitLateReason = () => {
        if (!lateReason.trim()) {
            showSwal('Error!', 'Alasan keterlambatan harus diisi.', 'error', 2000);
            return;
        }
        
        // Get the photo data from the camera modal
        const photoData = document.getElementById('camera-photo-data')?.value || '';
        processAttendance(photoData, 'Clock In', lateReason);
    };

    const submitEarlyLeaveReason = () => {
        if (!earlyLeaveReason.trim()) {
            showSwal('Error!', 'Alasan pulang lebih awal harus diisi.', 'error', 2000);
            return;
        }
        
        // Get the photo data from the camera modal
        const photoData = document.getElementById('camera-photo-data')?.value || '';
        processAttendance(photoData, 'Clock Out', earlyLeaveReason);
    };

    return (
        <>
            <GlassCard className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Absensi Hari Ini</h3>
                <p className="text-gray-600 mb-4 font-medium">{today}</p>
                {/* Menggunakan 'settings' */}
                <p className="text-sm text-gray-500 mb-4">Jam Kerja: {settings.startTime} - {settings.endTime}</p>

                <div className="flex justify-between items-center mb-4 p-4 border rounded-lg bg-blue-50">
                    <span className="font-semibold text-lg text-blue-700">Aksi Selanjutnya:</span>
                    <span className={`font-bold text-xl ${hasClockIn && !hasClockOut ? 'text-red-500' : 'text-green-500'}`}>
                        {hasClockIn && !hasClockOut ? 'Clock Out' : (hasClockOut ? 'Selesai' : 'Clock In')}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <PrimaryButton
                        onClick={() => setIsCameraOpen(true)}
                        disabled={hasClockOut}
                        className={`col-span-2 ${hasClockOut ? 'bg-gray-400 hover:bg-gray-400' : ''}`}
                    >
                        <i className={`fas fa-${hasClockIn ? 'sign-out-alt' : 'sign-in-alt'} mr-2`}></i>
                        {hasClockIn && !hasClockOut ? 'Clock Out Sekarang' : (hasClockOut ? 'Hari Ini Selesai' : 'Clock In Sekarang')}
                    </PrimaryButton>
                </div>

                <h4 className="text-lg font-bold text-gray-700 mt-6 mb-3">Riwayat Absensi Hari Ini</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {todayRecords.length > 0 ? todayRecords.map(record => (
                        <div key={record.id} className="flex justify-between items-center p-3 rounded-lg bg-white shadow-sm border border-gray-100">
                            <span className={`font-semibold ${record.type === 'Clock In' ? 'text-green-600' : 'text-red-600'}`}>{record.type}</span>
                            <span className="text-sm text-gray-500">{record.time}</span>
                            <span className={`text-xs ${record.late ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                {record.late ? 'Terlambat' : 'Tepat Waktu'}
                            </span>
                            <i className="fas fa-map-marker-alt text-blue-500" title={record.location}></i>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">Belum ada catatan absensi hari ini.</p>
                    )}
                </div>

                <CameraModal
                    isOpen={isCameraOpen}
                    onClose={() => setIsCameraOpen(false)}
                    onCapture={onCapture}
                    user={user}
                    title={`Ambil Foto Selfie untuk ${actionType}`}
                />
            </GlassCard>

            {/* Late Reason Modal */}
            {showLateReasonModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <GlassCard className="w-full max-w-md">
                        <h4 className="text-xl font-bold mb-4">Alasan Keterlambatan</h4>
                        <textarea
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            rows="4"
                            placeholder="Masukkan alasan keterlambatan Anda..."
                        ></textarea>
                        <div className="flex justify-end space-x-2 mt-4">
                            <PrimaryButton 
                                onClick={() => setShowLateReasonModal(false)} 
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Batal
                            </PrimaryButton>
                            <PrimaryButton onClick={submitLateReason}>
                                Kirim
                            </PrimaryButton>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Early Leave Reason Modal */}
            {showEarlyLeaveModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <GlassCard className="w-full max-w-md">
                        <h4 className="text-xl font-bold mb-4">Alasan Pulang Lebih Awal</h4>
                        <textarea
                            value={earlyLeaveReason}
                            onChange={(e) => setEarlyLeaveReason(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            rows="4"
                            placeholder="Masukkan alasan pulang lebih awal..."
                        ></textarea>
                        <div className="flex justify-end space-x-2 mt-4">
                            <PrimaryButton 
                                onClick={() => setShowEarlyLeaveModal(false)} 
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Batal
                            </PrimaryButton>
                            <PrimaryButton onClick={submitEarlyLeaveReason}>
                                Kirim
                            </PrimaryButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </>
    );
};

// --- A3. Riwayat Login Karyawan ---
const EmployeeLoginHistory = ({ user }) => {
    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Riwayat Login</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {user.currentMonthAttendance.map((record, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.division}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.type === 'Clock In' ? record.time : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.type === 'Clock Out' ? record.time : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

// --- A4. Pengajuan Cuti Karyawan ---
const EmployeeLeaveRequest = ({ user, setEmployees, setPendingLeave, pendingLeave }) => {
    const [leaveDays, setLeaveDays] = useState(1);
    const [reason, setReason] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Cuti Tahunan');
    const [medicalCertificate, setMedicalCertificate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const medicalCertificateRef = useRef(null);

    const handleMedicalCertificateChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedicalCertificate({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = (e) => {
        e.preventDefault();
        // Logic Pengajuan Cuti
        const newRequest = {
            id: Date.now(),
            employeeId: user.id,
            name: user.name,
            type,
            title: title || reason.substring(0, 30) + '...',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + leaveDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            days: leaveDays,
            reason: reason,
            status: 'Pending',
            medicalCertificate: type === 'Izin Sakit' ? medicalCertificate : null,
        };

        setPendingLeave(prev => [...prev, newRequest]);
        
        // Only reduce leave balance if it's not sick leave
        if (type !== 'Izin Sakit') {
            setEmployees(prev => prev.map(emp => emp.id === user.id ? { ...emp, cutiBalance: emp.cutiBalance - leaveDays } : emp));
        }
        
        showSwal('Berhasil!', `Permintaan ${leaveDays} hari ${type.toLowerCase()} berhasil diajukan. Menunggu persetujuan manajer.`, 'success', 3000);
        setLeaveDays(1);
        setReason('');
        setTitle('');
        setMedicalCertificate(null);
    };

    const currentEmployee = pendingLeave.filter(req => req.employeeId === user.id);
    const filteredRequests = currentEmployee.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pengajuan Cuti</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard
                    title="Sisa Cuti Tahunan"
                    value={`${user.cutiBalance} hari`}
                    icon="fas fa-umbrella-beach"
                    color="green"
                />
                <StatCard
                    title="Cuti Pending"
                    value={`${currentEmployee.length} permintaan`}
                    icon="fas fa-hourglass-half"
                    color="yellow"
                />
            </div>

            <form onSubmit={handleApply} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-bold text-gray-700">Ajukan Permintaan Baru</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Judul Cuti</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Contoh: Liburan Keluarga"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Cuti</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option>Cuti Tahunan</option>
                        <option>Izin Sakit</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah Hari</label>
                    <input
                        type="number"
                        min="1"
                        max={type === 'Cuti Tahunan' ? user.cutiBalance : 99}
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(parseInt(e.target.value))}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Alasan/Keterangan</label>
                    <textarea
                        rows="3"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                </div>
                {type === 'Izin Sakit' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Surat Dokter</label>
                        <div className="mt-1 flex items-center">
                            <input
                                type="file"
                                ref={medicalCertificateRef}
                                onChange={handleMedicalCertificateChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => medicalCertificateRef.current.click()}
                                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <i className="fas fa-upload mr-2"></i>
                                Upload Surat Dokter
                            </button>
                            {medicalCertificate && (
                                <span className="ml-3 text-sm text-gray-500">{medicalCertificate.name}</span>
                            )}
                        </div>
                    </div>
                )}
                <PrimaryButton type="submit" disabled={type === 'Cuti Tahunan' && leaveDays > user.cutiBalance}>
                    <i className="fas fa-paper-plane mr-2"></i> Ajukan Cuti
                </PrimaryButton>
            </form>

            <div className="mt-6 flex justify-between items-center">
                <h4 className="text-lg font-bold text-gray-700">Riwayat Permintaan Cuti</h4>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari permintaan cuti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                </div>
            </div>
            {filteredRequests.length > 0 ? filteredRequests.map(req => (
                <div key={req.id} className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg mb-2 flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{req.title} ({req.type} - {req.days} hari)</p>
                        <p className="text-sm text-gray-600">{req.startDate} s/d {req.endDate}</p>
                        {req.medicalCertificate && (
                            <p className="text-xs text-blue-600 mt-1">
                                <i className="fas fa-file-medical mr-1"></i>
                                {req.medicalCertificate.name}
                            </p>
                        )}
                    </div>
                    <span className={`text-sm font-bold ${
                        req.status === 'Approved' ? 'text-green-700' : 
                        req.status === 'Rejected' ? 'text-red-700' : 
                        'text-yellow-700'
                    }`}>
                        {req.status}
                    </span>
                </div>
            )) : (
                <p className="text-gray-500 text-center py-4">Tidak ada permintaan cuti pending.</p>
            )}
        </GlassCard>
    );
};

// --- A5. Keterangan Gaji Karyawan ---
const EmployeeSalary = ({ user, employees }) => {
    const employee = employees.find(e => e.id === user.id);
    if (!employee || !employee.salaryDetails) return <p>Detail gaji tidak tersedia.</p>;

    const details = employee.salaryDetails;
    const totalSalary = calculateTotalSalary(details);

    // --- Export PDF ---
    const exportToPDF = () => {
        const doc = new jsPDF();

        autoTable(doc, {
            head: [['Komponen', 'Jumlah']],
            body: [
                ['Gaji Pokok', formattedCurrency(details.basic)],
                ['Tunjangan', formattedCurrency(details.allowance)],
                ['Lembur', formattedCurrency(details.overtimeHours * details.overtimeRate)],
                ['Bonus', formattedCurrency(details.bonus)],
                ['Potongan', formattedCurrency(details.deductions)],
                ['Total Gaji Bersih', formattedCurrency(totalSalary)]
            ],
            startY: 20,
        });

        doc.save('slip_gaji.pdf');
    };

    // --- Export Excel ---
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet([
            { Komponen: 'Gaji Pokok', Jumlah: details.basic },
            { Komponen: 'Tunjangan', Jumlah: details.allowance },
            { Komponen: 'Lembur', Jumlah: details.overtimeHours * details.overtimeRate },
            { Komponen: 'Bonus', Jumlah: details.bonus },
            { Komponen: 'Potongan', Jumlah: details.deductions },
            { Komponen: 'Total Gaji Bersih', Jumlah: totalSalary }
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Slip Gaji');
        XLSX.writeFile(wb, 'slip_gaji.xlsx');
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Keterangan Gaji Bulanan</h3>

            <div className="p-4 bg-blue-100 rounded-lg mb-4 flex justify-between items-center">
                <span className="text-lg font-bold text-blue-800">TOTAL GAJI BERSIH (Estimasi)</span>
                <span className="text-3xl font-extrabold text-blue-800">{formattedCurrency(totalSalary)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Penghasilan */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                    <h4 className="font-bold text-green-700 mb-2">Penghasilan (+)</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Gaji Pokok:</span><span>{formattedCurrency(details.basic)}</span></div>
                        <div className="flex justify-between"><span>Tunjangan:</span><span>{formattedCurrency(details.allowance)}</span></div>
                        <div className="flex justify-between"><span>Lembur ({details.overtimeHours} jam):</span><span>{formattedCurrency(details.overtimeHours * details.overtimeRate)}</span></div>
                        <div className="flex justify-between"><span>Bonus:</span><span>{formattedCurrency(details.bonus)}</span></div>
                        <div className="pt-2 border-t font-bold flex justify-between text-green-700">
                            <span>Total Kotor:</span>
                            <span>{formattedCurrency(details.basic + details.allowance + (details.overtimeHours * details.overtimeRate) + details.bonus)}</span>
                        </div>
                    </div>
                </div>

                {/* Potongan */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                    <h4 className="font-bold text-red-700 mb-2">Potongan (-)</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Potongan Umum:</span><span>{formattedCurrency(details.deductions)}</span></div>
                        <div className="pt-2 border-t font-bold flex justify-between text-red-700">
                            <span>Total Potongan:</span>
                            <span>{formattedCurrency(details.deductions)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <button
                    onClick={exportToPDF}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                    <i className="fas fa-file-pdf mr-2"></i> Export PDF
                </button>
                <button
                    onClick={exportToExcel}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                    <i className="fas fa-file-excel mr-2"></i> Export Excel
                </button>
            </div>
        </GlassCard>
    );
};

// --- A6. Performa Karyawan (FIXED) ---
const EmployeePerformance = ({ user, tasks = [], performanceScore }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Kalau tasks kosong, kasih warning di console (biar gampang debug)
    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            console.warn("⚠️ EmployeePerformance: tidak ada data tugas untuk user:", user?.name || '(unknown)');
        }
    }, [tasks, user]);

    // Hindari crash: filter hanya kalau tasks array
    const filteredTasks = Array.isArray(tasks)
        ? tasks.filter(task =>
            (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Performa Kerja</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard 
                    title="Skor Performa" 
                    value={`${performanceScore}/100`} 
                    icon="fas fa-chart-line" 
                    color={performanceScore >= 80 ? "green" : performanceScore >= 60 ? "yellow" : "red"} 
                />
                <StatCard 
                    title="Tugas Selesai" 
                    value={`${tasks.filter(t => t.status === 'Completed').length}/${tasks.length}`} 
                    icon="fas fa-check-circle" 
                    color="blue" 
                />
                <StatCard 
                    title="Tugas Pending" 
                    value={`${tasks.filter(t => t.status === 'Pending').length}`} 
                    icon="fas fa-clock" 
                    color="yellow" 
                />
            </div>

            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari tugas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTasks.length > 0 ? filteredTasks.map(task => (
                    <div key={task.id} className={`p-4 rounded-lg border-l-4 ${
                        task.status === 'Completed' ? 'bg-green-50 border-green-500' : 
                        task.status === 'In Progress' ? 'bg-blue-50 border-blue-500' : 
                        'bg-yellow-50 border-yellow-500'
                    }`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <i className="fas fa-calendar-alt mr-1"></i>
                                    <span>Deadline: {task.deadline || '-'}</span>
                                    {task.assignedBy && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <i className="fas fa-user mr-1"></i>
                                            <span>Dari: {task.assignedBy}</span>
                                        </>
                                    )}
                                </div>
                                {task.file && (
                                    <div className="mt-2">
                                        <a 
                                            href={task.file.data} 
                                            download={task.file.name}
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                        >
                                            <i className="fas fa-paperclip mr-1"></i>
                                            {task.file.name}
                                        </a>
                                    </div>
                                )}
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
                )) : (
                    <p className="text-gray-500 text-center py-8">
                        {tasks.length === 0 ? 'Belum ada tugas yang diberikan.' : 'Tidak ada tugas yang cocok dengan pencarian.'}
                    </p>
                )}
            </div>
        </GlassCard>
    );
};


// --- EMPLOYEE DASHBOARD WRAPPER ---
const EmployeeDashboard = (props) => {
    // --- IMPORTANT FIX: include setEmployees from props (fallback to noop)
    const { user, employees, setEmployees = () => {}, setAuthUser, workSettings, pendingProfileChanges, setPendingProfileChanges } = props;
    const [activeTab, setActiveTab] = useState('attendance');
    
    // Calculate performance score based on attendance and tasks
    const calculatePerformanceScore = () => {
        // Get attendance data
        const attendanceRecords = user.currentMonthAttendance || [];
        const totalDays = new Date().getDate(); // Current day of month
        const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
        const attendanceScore = (presentDays / totalDays) * 50; // 50% of score from attendance
        
        // Get tasks data
        const tasks = props.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalTasks = tasks.length || 1; // Avoid division by zero
        const taskScore = (completedTasks / totalTasks) * 50; // 50% of score from tasks
        
        return Math.round(attendanceScore + taskScore);
    };
    
    const performanceScore = calculatePerformanceScore();

    // FIX KRUSIAL: Pastikan user di sini punya struktur lengkap
   useEffect(() => {
    // Cari data karyawan penuh dari daftar employees dan update authUser
    if (user && employees) {
        const fullEmployee = employees.find(e => String(e.id) === String(user.id));
        if (fullEmployee) {
            setAuthUser(fullEmployee); // update user jadi versi lengkap
        } else {
            console.warn("EmployeeDashboard: fullEmployee tidak ditemukan untuk id:", user.id);
        }
    }
}, [user, employees, setAuthUser]);


    // --- SAFETY CHECK + fallback workSettings ---
    // Ambil workSettings dari props terlebih dahulu; kalau undefined -> coba localStorage -> kalau tetap nggak ada pakai default
    let effectiveWorkSettings = workSettings;
    try {
      if (!effectiveWorkSettings) {
        const stored = localStorage.getItem('workSettings');
        if (stored) {
          effectiveWorkSettings = JSON.parse(stored);
          console.log("EmployeeDashboard: loaded workSettings from localStorage:", effectiveWorkSettings);
        } else {
          // default fallback
          effectiveWorkSettings = { startTime: '08:00', endTime: '17:00', lateDeduction: 0, earlyLeaveDeduction: 0 };
          console.warn("EmployeeDashboard: workSettings not provided; using default fallback:", effectiveWorkSettings);
        }
      }
    } catch (err) {
      effectiveWorkSettings = { startTime: '08:00', endTime: '17:00', lateDeduction: 0, earlyLeaveDeduction: 0 };
      console.error("EmployeeDashboard: error parsing workSettings from localStorage:", err);
    }

    // Update props variable usage if needed: buat var safeWorkSettings
    const safeWorkSettings = effectiveWorkSettings;

    // Jika user belum punya data absensi/gaji, tampil spinner minimal (tanpa memaksa workSettings)
    if (!user?.currentMonthAttendance || !user?.salaryDetails) {
      console.log("EmployeeDashboard: user data incomplete:", {
        user,
        foundEmployee: employees ? employees.find(e => String(e.id) === String(user?.id)) : null,
        safeWorkSettings
      });
      return (
        <div className="p-8 text-center text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i> Memuat data karyawan...
        </div>
      );
    }


    return (
        <div className="py-4">
            {/* Header */}
            <div className="flex space-x-3 overflow-x-auto mb-6 pb-2">
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-clock mr-2"></i> Absensi
                </TabButton>
                <TabButton isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <i className="fas fa-user mr-2"></i> Profil
                </TabButton>
                <TabButton isActive={activeTab === 'leave'} onClick={() => setActiveTab('leave')}>
                    <i className="fas fa-calendar-alt mr-2"></i> Cuti
                </TabButton>
                <TabButton isActive={activeTab === 'salary'} onClick={() => setActiveTab('salary')}>
                    <i className="fas fa-money-bill-wave mr-2"></i> Gaji
                </TabButton>
                <TabButton isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                    <i className="fas fa-chart-line mr-2"></i> Performa
                </TabButton>
                <TabButton isActive={activeTab === 'loginHistory'} onClick={() => setActiveTab('loginHistory')}>
                    <i className="fas fa-history mr-2"></i> Riwayat Login
                </TabButton>
            </div>

            {/* Content */}
{activeTab === 'attendance' && (
  <EmployeeAttendance
    user={user}
    employees={employees}
    setEmployees={setEmployees}
    workSettings={safeWorkSettings}
  />
)}
            {activeTab === 'profile' && <EmployeeProfile {...props} pendingProfileChanges={pendingProfileChanges} setPendingProfileChanges={setPendingProfileChanges} />}
            {activeTab === 'leave' && <EmployeeLeaveRequest {...props} />}
            {activeTab === 'salary' && <EmployeeSalary {...props} />}
            {activeTab === 'performance' && <EmployeePerformance {...props} performanceScore={performanceScore} />}
            {activeTab === 'loginHistory' && <EmployeeLoginHistory {...props} />}
        </div>
    );
};

export default EmployeeDashboard;
