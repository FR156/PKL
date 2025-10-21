// src/components/Profiles/SupervisorProfile.jsx
// KODE INI SAMA PERSIS dengan Manager/Employee Profile
import React, { useState, useRef, useEffect } from 'react';
import { PrimaryButton } from '../UI/Buttons.jsx'; 
import { GlassCard } from '../UI/Cards.jsx'; 
import { showSwal } from '../../utils/swal.js'; 

// --- D6. Profil Supervisor ---
const SupervisorProfile = ({ user, employees, setEmployees, setAuthUser, pendingProfileChanges, setPendingProfileChanges }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [profileImage, setProfileImage] = useState(user.profileImage || null);
    const [cvFile, setCvFile] = useState(user.cvFile || null);
    const [diplomaFile, setDiplomaFile] = useState(user.diplomaFile || null);
    
    const fileInputRef = useRef(null);
    const cvInputRef = useRef(null);
    const diplomaInputRef = useRef(null);

    // Supervisor mengirim permintaan ke Manager/Owner (Asumsi Manager yang menyetujui)
    const pendingRequest = pendingProfileChanges.find(p => p.employeeId === user.id);
    
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
        setCvFile(e.target.files[0]);
    };

    const handleDiplomaChange = (e) => {
        setDiplomaFile(e.target.files[0]);
    };

    const handleSave = () => {
        const changes = {};
        let hasChanges = false;
        
        const editableFields = ['email', 'phone', 'address'];

        editableFields.forEach(key => {
            if (formData[key] !== user[key]) {
                changes[key] = formData[key];
                hasChanges = true;
            }
        });

        if (profileImage !== user.profileImage) {
            changes.profileImage = profileImage;
            hasChanges = true;
        }

        if (cvFile && cvFile !== user.cvFile) {
            // Hanya simpan metadata file untuk simulasi
            changes.cvFile = { name: cvFile.name, size: cvFile.size, type: cvFile.type, data: 'placeholder' };
            hasChanges = true;
        }

        if (diplomaFile && diplomaFile !== user.diplomaFile) {
            changes.diplomaFile = { name: diplomaFile.name, size: diplomaFile.size, type: diplomaFile.type, data: 'placeholder' };
            hasChanges = true;
        }

        if (!hasChanges) {
            showSwal('Tidak Ada Perubahan', 'Anda tidak membuat perubahan apa pun.', 'info');
            setIsEditing(false);
            return;
        }

        // Kirim permintaan ke Manager/Owner (simulasi)
        handleRequestProfileUpdate(changes);
    };

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

        setPendingProfileChanges(prev => [...prev, newRequest]);

        showSwal(
            'Permintaan Terkirim',
            'Perubahan profil Anda memerlukan persetujuan Manager/Owner. Status: Pending.',
            'warning'
        );
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data ke user data awal
        setFormData({ ...user });
        setProfileImage(user.profileImage || null);
        setCvFile(user.cvFile || null);
        setDiplomaFile(user.diplomaFile || null);
        setIsEditing(false);
    };

    useEffect(() => {
        // Sinkronisasi state lokal dengan props user setiap kali user berubah
        setFormData({ ...user });
        setProfileImage(user.profileImage || null);
        setCvFile(user.cvFile || null);
        setDiplomaFile(user.diplomaFile || null);
    }, [user]);

    return (
        <GlassCard className="mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-user-circle mr-3 text-purple-600"></i> Profil Supervisor
            </h2>

            {/* Status Pending Perubahan */}
            {pendingRequest && (
                <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-sm">
                    <p className="font-bold">Permintaan Perubahan Pending</p>
                    <p className="text-sm">Anda memiliki permintaan perubahan data yang menunggu persetujuan **Manager/Owner**.</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative mb-4">
                        <img
                            src={profileImage || 'https://picsum.photos/seed/supervisor/150/150.jpg'}
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover border-4 border-purple-500 shadow-xl"
                        />
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                                title="Ubah Foto Profil"
                            >
                                <i className="fas fa-camera"></i>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{user.name}</h3>
                    <p className="text-lg font-medium text-purple-600 mt-1 uppercase">SUPERVISOR</p>
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
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'} transition-all`}
                                />
                            </div>

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

export default SupervisorProfile;