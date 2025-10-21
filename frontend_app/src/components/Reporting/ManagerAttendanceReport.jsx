    // src/components/Reporting/ManagerAttendanceReport.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../UI/Cards';
import { PrimaryButton } from '../UI/Buttons';
import { showSwal } from '../../utils/swal';

// --- B6. Laporan Absensi Selfie ---
const ManagerAttendanceReport = ({ employees }) => {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // Kumpulkan semua foto absensi dari semua karyawan dan filter berdasarkan tanggal
    const filteredPhotos = useMemo(() => {
        // Gabungkan semua attendancePhotos dari setiap karyawan
        const allPhotos = employees.flatMap(emp => 
            emp.attendancePhotos ? emp.attendancePhotos.map(photo => ({
                ...photo,
                employeeName: emp.name, // Tambahkan nama karyawan
                employeeDivision: emp.division || 'N/A' // Tambahkan divisi
            })) : []
        );

        // Filter berdasarkan tanggal yang dipilih
        return allPhotos.filter(photo => photo.date === filterDate);
    }, [employees, filterDate]);

    // Handler untuk menampilkan modal foto
    const handleViewPhoto = (photo) => {
        setSelectedPhoto(photo);
    };

    // Handler untuk Export data ke Excel
    const handleExportExcel = () => {
        const { default: XLSX } = require('xlsx'); // Import lokal

        const data = filteredPhotos.map(photo => ({
            "Tanggal": photo.date,
            "Waktu": photo.time,
            "Nama Karyawan": photo.employeeName,
            "Tipe Absensi": photo.type,
            "Lokasi": photo.location,
            "ID Karyawan": photo.employeeId,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi Selfie");
        
        XLSX.writeFile(workbook, `Laporan_Absensi_Selfie_${filterDate}.xlsx`);
        showSwal('Berhasil!', 'Laporan Absensi Selfie telah di-export ke Excel.', 'success');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-camera mr-3 text-purple-600"></i> Laporan Absensi Selfie
            </h2>

            <GlassCard>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                    {/* Filter Tanggal */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <label htmlFor="date-filter" className="font-medium text-gray-700">Pilih Tanggal:</label>
                        <input
                            type="date"
                            id="date-filter"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                        />
                    </div>
                    {/* Tombol Export */}
                    <PrimaryButton onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-sm py-2 px-4 w-full md:w-auto">
                        <i className="fas fa-file-excel mr-2"></i> Export Data
                    </PrimaryButton>
                </div>
                
                {/* Grid Foto Absensi */}
                {filteredPhotos.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Tidak ada foto absensi pada tanggal **{filterDate}**.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[70vh] overflow-y-auto">
                        {filteredPhotos.map((photo) => (
                            <div 
                                key={photo.id} 
                                className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => handleViewPhoto(photo)}
                            >
                                {/* Foto Selfie */}
                                <img
                                    src={photo.photo}
                                    alt={`Absensi ${photo.employeeName} pada ${photo.time}`}
                                    className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                                />
                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="font-semibold text-sm truncate">{photo.employeeName}</p>
                                    <p className="text-xs">{photo.type} | {photo.time}</p>
                                    <p className="text-xs italic mt-1 text-gray-200 truncate" title={photo.location}>{photo.location.split('(')[0]}</p>
                                </div>
                                {/* Badge Tipe */}
                                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${photo.type === 'Clock In' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                                    {photo.type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Modal Detail Foto (Sederhana) */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <GlassCard className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Detail Foto Absensi</h3>
                            <button onClick={() => setSelectedPhoto(null)} className="text-gray-500 hover:text-gray-800"><i className="fas fa-times"></i></button>
                        </div>
                        <img 
                            src={selectedPhoto.photo} 
                            alt="Absensi detail" 
                            className="w-full h-auto rounded-lg mb-4 object-cover"
                        />
                        <p className="text-lg font-semibold">{selectedPhoto.employeeName}</p>
                        <p className="text-sm text-gray-600">{selectedPhoto.employeeDivision} - {selectedPhoto.type}</p>
                        <p className="text-sm text-gray-600 mt-1"><i className="fas fa-calendar-day mr-1"></i> {selectedPhoto.date} <i className="fas fa-clock mx-1"></i> {selectedPhoto.time}</p>
                        <p className="text-sm text-blue-600 mt-2 font-medium break-words"><i className="fas fa-map-marker-alt mr-1"></i> {selectedPhoto.location}</p>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default ManagerAttendanceReport;