// src/components/Profiles/ManagerProfile.jsx
// Kode ini SAMA PERSIS dengan src/components/Profiles/EmployeeProfile.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PrimaryButton } from '../UI/Buttons'; 
import { GlassCard } from '../UI/Cards'; 
import { showSwal } from '../../utils/swal'; 

// --- B8. Profil Manager ---
const ManagerProfile = ({ user, employees, setEmployees, setAuthUser, pendingProfileChanges, setPendingProfileChanges }) => {
    // Catatan: Karena Manajer juga bisa memiliki perubahan profil yang pending, 
    // kita tetap menggunakan logika pendingProfileChanges.
    
    // State lokal untuk mode edit dan data form
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    
    // State untuk file yang diunggah
    const [profileImage, setProfileImage] = useState(user.profileImage || null);
    const [cvFile, setCvFile] = useState(user.cvFile || null);
    const [diplomaFile, setDiplomaFile] = useState(user.diplomaFile || null);
    
    // Ref untuk memicu dialog input file
    const fileInputRef = useRef(null);
    const cvInputRef = useRef(null);
    const diplomaInputRef = useRef(null);

    // Cari apakah ada pending request untuk user ini (Manajer)
    const pendingRequest = pendingProfileChanges.find(p => p.employeeId === user.id);
    
    // --- Handlers ---
    
    // Handler untuk perubahan input teks
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler untuk perubahan gambar profil (diubah ke Base64 untuk simulasi)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler untuk upload file (CV/Ijazah)
    const handleCvChange = (e) => {
        setCvFile(e.target.files[0]);
    };

    const handleDiplomaChange = (e) => {
        setDiplomaFile(e.target.files[0]);
    };

    // Handler untuk menyimpan perubahan data
    const handleSave = () => {
        // 1. Cek apakah ada perubahan
        const changes = {};
        let hasChanges = false;
        
        // Cek perubahan data form (hanya field yang diizinkan diubah)
        const editableFields = ['email', 'phone', 'address'];

        editableFields.forEach(key => {
            if (formData[key] !== user[key]) {
                changes[key] = formData[key];
                hasChanges = true;
            }
        });

        // Cek perubahan gambar profil
        if (profileImage !== user.profileImage) {
            changes.profileImage = profileImage;
            hasChanges = true;
        }

        // Cek perubahan file CV
        if (cvFile && cvFile !== user.cvFile) {
            // Simpan metadata file untuk Manager Approval
            changes.cvFile = { name: cvFile.name, size: cvFile.size, type: cvFile.type, data: 'placeholder' };
            hasChanges = true;
        }

        // Cek perubahan file Ijazah
        if (diplomaFile && diplomaFile !== user.diplomaFile) {
            changes.diplomaFile = { name: diplomaFile.name, size: diplomaFile.size, type: diplomaFile.type, data: 'placeholder' };
            hasChanges = true;
        }

        if (!hasChanges) {
            showSwal('Tidak Ada Perubahan', 'Anda tidak membuat perubahan apa pun.', 'info');
            setIsEditing(false);
            return;
        }

        // 2. Jika ada perubahan, kirim permintaan ke Owner (simulasi)
        // Karena Manajer mengubah datanya sendiri, dia perlu meminta persetujuan ke tingkatan di atasnya (Owner)
        handleRequestProfileUpdate(changes);
    };

    // Handler untuk mengirim permintaan perubahan ke Owner
    const handleRequestProfileUpdate = (changes) => {
        const newRequestId = Date.now(); 

        const newRequest = {
            id: newRequestId,
            employeeId: user.id,
            employeeName: user.name,
            requestedChanges: changes,
            status: 'Pending',
            requestedAt: new Date().toISOString().split('T')[0]
        };

        // Tambahkan ke state global pendingProfileChanges (untuk Owner/Approval di atasnya)
        setPendingProfileChanges(prev => [...prev, newRequest]);

        showSwal(
            'Permintaan Terkirim',
            'Perubahan profil Anda memerlukan persetujuan Owner. Status: Pending.',
            'warning'
        );
        setIsEditing(false);
    };

    // Handler membatalkan mode edit
    const handleCancel = () => {
        // Reset semua state ke nilai awal user
        setFormData({ ...user });
        setProfileImage(user.profileImage || user.profileImage || null);
        setCvFile(user.cvFile || null);
        setDiplomaFile(user.diplomaFile || null);
        setIsEditing(false);
    };


    // --- Efek untuk reset state saat user berubah ---
    useEffect(() => {
        setFormData({ ...user });
        setProfileImage(user.profileImage || null);
        setCvFile(user.cvFile || null);
        setDiplomaFile(user.diplomaFile || null);
    }, [user]);


    return (
        <GlassCard className="mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-user-circle mr-3 text-blue-600"></i> Profil Manajer
            </h2>

            {/* Status Pending Perubahan */}
            {pendingRequest && (
                <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-sm">
                    <p className="font-bold">Permintaan Perubahan Pending</p>
                    <p className="text-sm">Anda memiliki permintaan perubahan data yang menunggu persetujuan **Owner**.</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Kolom Kiri: Foto dan Info Utama */}
                <div className="md:w-1/3 flex flex-col items-center">
                    {/* Foto Profil */}
                    <div className="relative mb-4">
                        <img
                            src={profileImage || 'https://picsum.photos/seed/manager/150/150.jpg'}
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                        />
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                title="Ubah Foto Profil"
                            >
                                <i className="fas fa-camera"></i>
                            </button>
                        )}
                        {/* Hidden input file */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    
                    {/* Nama dan Role */}
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{user.name}</h3>
                    <p className="text-lg font-medium text-blue-600 mt-1 uppercase">MANAJER</p>
                    <p className="text-sm text-gray-500 mt-1">ID: {user.id}</p>

                    <div className="mt-6 w-full">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Tanggal Bergabung:</p>
                        <span className="bg-gray-100 text-gray-700 p-2 rounded-lg text-sm font-mono w-full block text-center">
                            {user.joinDate}
                        </span>
                        <p className="text-sm text-gray-600 font-semibold mt-4 mb-2">Sisa Cuti Tahunan:</p>
                        <span className="bg-green-100 text-green-700 p-2 rounded-lg text-lg font-extrabold w-full block text-center">
                            {user.cutiBalance || 0} Hari
                        </span>
                    </div>
                </div>

                {/* Kolom Kanan: Detail Data & Edit Form */}
                <div className="md:w-2/3">
                    <div className="flex justify-end mb-4">
                        {isEditing ? (
                            <div className="space-x-3">
                                <PrimaryButton onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600" disabled={!!pendingRequest}>
                                    <i className="fas fa-times mr-2"></i> Batal
                                </PrimaryButton>
                                <PrimaryButton onClick={handleSave} disabled={!!pendingRequest}>
                                    <i className="fas fa-save mr-2"></i> Simpan & Kirim Permintaan
                                </PrimaryButton>
                            </div>
                        ) : (
                            <PrimaryButton onClick={() => setIsEditing(true)} disabled={!!pendingRequest}>
                                <i className="fas fa-edit mr-2"></i> Ubah Profil
                            </PrimaryButton>
                        )}
                    </div>
                    
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-blue-300 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                    required
                                />
                            </div>
                            
                            {/* Telepon */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-blue-300 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                />
                            </div>
                            
                            {/* Alamat */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-blue-300 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                />
                            </div>

                            {/* Dokumen: CV */}
                            <div className="border p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum Vitae (CV)</label>
                                {isEditing ? (
                                    <>
                                        <PrimaryButton onClick={() => cvInputRef.current.click()} className="bg-yellow-500 hover:bg-yellow-600 text-sm py-2 px-3">
                                            <i className="fas fa-upload mr-2"></i> Ganti CV
                                        </PrimaryButton>
                                        <input type="file" ref={cvInputRef} onChange={handleCvChange} accept=".pdf" className="hidden" />
                                        {cvFile && <p className="mt-2 text-xs text-gray-600">File: <span className="font-semibold">{cvFile.name || cvFile.data?.name || 'Tersimpan'}</span></p>}
                                    </>
                                ) : (
                                    <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline text-sm">
                                        <i className="fas fa-file-pdf mr-1"></i> Lihat CV (Simulasi)
                                    </a>
                                )}
                            </div>

                            {/* Dokumen: Ijazah */}
                            <div className="border p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ijazah Terakhir</label>
                                {isEditing ? (
                                    <>
                                        <PrimaryButton onClick={() => diplomaInputRef.current.click()} className="bg-yellow-500 hover:bg-yellow-600 text-sm py-2 px-3">
                                            <i className="fas fa-upload mr-2"></i> Ganti Ijazah
                                        </PrimaryButton>
                                        <input type="file" ref={diplomaInputRef} onChange={handleDiplomaChange} accept=".pdf" className="hidden" />
                                        {diplomaFile && <p className="mt-2 text-xs text-gray-600">File: <span className="font-semibold">{diplomaFile.name || diplomaFile.data?.name || 'Tersimpan'}</span></p>}
                                    </>
                                ) : (
                                    <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline text-sm">
                                        <i className="fas fa-file-alt mr-1"></i> Lihat Ijazah (Simulasi)
                                    </a>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </GlassCard>
    );
};

export default ManagerProfile;