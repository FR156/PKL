// src/pages/Dashboard/OwnerDashboard/OwnerAttendanceReport.jsx
import React, { useState, useMemo } from 'react';
import { TabButton } from "../../../components/Shared/Modals/componentsUtilityUI.jsx";

// --- Komponen Modal Foto Selfie ---
const PhotoModal = ({ isOpen, onClose, photoData, employeeName, dateTime }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-50" onClick={onClose}>
            <GlassCard className="max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Foto Absensi - {employeeName}</h3>
                <p className="text-sm text-gray-500 mb-4">{dateTime}</p>
                
                <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    {photoData ? (
                        <img 
                            src={photoData} 
                            alt={`Absensi ${employeeName}`} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Foto Tidak Tersedia</div>
                    )}
                </div>
                
                <div className="mt-4 flex justify-end">
                    <PrimaryButton onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
                        Tutup
                    </PrimaryButton>
                </div>
            </GlassCard>
        </div>
    );
};
// --- End Komponen Modal Foto Selfie ---


// Flatten dan gabungkan semua data foto absensi dari semua personil
const flattenPhotoAttendanceData = (employees, managers, supervisors) => {
    const allPersonnel = [...employees, ...managers, ...supervisors];
    
    // Asumsi: Kita menyimpan 'attendancePhotos' terpisah untuk setiap personil
    // Kita perlu mendapatkan semua record foto, yang juga berisi employeeName, date, time
    const photoRecords = allPersonnel.flatMap(person => 
        (person.attendancePhotos || []).map(photoRecord => ({
            ...photoRecord,
            employeeName: person.name,
            division: person.division || person.role,
            role: person.role,
        }))
    );

    // Filter duplikat (jika ada) dan urutkan
    return photoRecords.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
};


const OwnerAttendanceReport = ({ employees, managers, supervisors }) => {
    const fullPhotoData = useMemo(() => flattenPhotoAttendanceData(employees, managers, supervisors), [employees, managers, supervisors]);
    
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDivision, setFilterDivision] = useState('All');
    
    // State untuk Modal Foto
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const uniqueDivisions = ['All', ...new Set([...employees, ...managers, ...supervisors].map(e => e.division || e.role))];
    
    const filteredData = fullPhotoData.filter(d => 
        (filterDivision === 'All' || d.division === filterDivision) &&
        (d.date === filterDate)
    );

    const handleViewPhoto = (photoRecord) => {
        setSelectedPhoto(photoRecord);
        setIsModalOpen(true);
    };

    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laporan Absensi Selfie (Verifikasi)</h2>
            
            <div className="flex flex-wrap gap-4 justify-start items-center mb-4">
                <div className="flex items-center gap-3">
                    <div>
                        <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 mr-2">Tanggal:</label>
                        <input
                            type="date"
                            id="date-filter"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="p-2 border rounded"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div>
                        <label htmlFor="division-filter" className="text-sm font-medium text-gray-700 mr-2">Divisi/Role:</label>
                        <select 
                            id="division-filter"
                            value={filterDivision}
                            onChange={(e) => setFilterDivision(e.target.value)}
                            className="p-2 border rounded"
                        >
                            {uniqueDivisions.map(div => (
                                <option key={div} value={div}>{div}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-orange-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama & Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Waktu & Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lokasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Foto Selfie</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((d, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{d.employeeName}</div>
                                    <div className="text-xs text-gray-500">{d.division} ({d.role})</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="font-semibold text-gray-700">{d.time}</span> ({d.type})
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                    {d.location.split(' (')[1]?.replace(')', '') || 'Lokasi tidak tersedia'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.type === 'Clock In' && d.late ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {d.type === 'Clock In' && d.late ? 'Terlambat' : 'Tepat Waktu/Normal'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <PrimaryButton onClick={() => handleViewPhoto(d)} className="bg-blue-500 hover:bg-blue-600 p-2 text-sm">
                                        <i className="fas fa-camera"></i> Lihat Foto
                                    </PrimaryButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredData.length === 0 && (
                <p className="text-center text-gray-500 mt-4">Tidak ada data absensi foto untuk kriteria yang dipilih.</p>
            )}

            {/* Modal untuk menampilkan foto */}
            {selectedPhoto && (
                <PhotoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    photoData={selectedPhoto.photo}
                    employeeName={selectedPhoto.employeeName}
                    dateTime={`${selectedPhoto.date}, ${selectedPhoto.time}`}
                />
            )}
        </GlassCard>
    );
};

export default OwnerAttendanceReport;