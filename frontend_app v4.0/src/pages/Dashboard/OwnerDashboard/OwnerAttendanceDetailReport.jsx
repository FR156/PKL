// src/pages/Dashboard/OwnerDashboard/OwnerAttendanceDetailReport.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard, PrimaryButton } from '../../../components/Shared/Modals/componentsUtilityUI';
import { formattedCurrency } from '../../../utils/formatters'; // Hapus PrimaryButton, showSwal
import { showSwal } from '../../../utils/swal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Flatten dan gabungkan semua data absensi dari semua personil
const flattenAttendanceData = (employees, managers, supervisors) => {
    const allPersonnel = [...employees, ...managers, ...supervisors];
    
    return allPersonnel.flatMap(person => 
        (person.currentMonthAttendance || []).map(record => ({
            ...record,
            employeeName: person.name,
            division: person.division || person.role,
            role: person.role,
        }))
    ).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)); // Urutkan terbaru
};

const OwnerAttendanceDetailReport = ({ employees, managers, supervisors }) => {
    const fullAttendanceData = useMemo(() => flattenAttendanceData(employees, managers, supervisors), [employees, managers, supervisors]);
    
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDivision, setFilterDivision] = useState('All');
    
    const uniqueDivisions = ['All', ...new Set([...employees, ...managers, ...supervisors].map(e => e.division || e.role))];
    
    const filteredData = fullAttendanceData.filter(d => 
        (filterDivision === 'All' || d.division === filterDivision) &&
        (d.date === filterDate)
    );

    // --- FUNGSI EKSPOR ---
    const handleExport = (type) => {
        if (filteredData.length === 0) {
            showSwal('Gagal Export', 'Tidak ada data absensi untuk diexport pada tanggal ini.', 'warning');
            return;
        }
        
        const fileName = `LaporanAbsensiDetail_${filterDate}_${filterDivision}`;

        const tableData = filteredData.map(d => [
            d.employeeName,
            d.division,
            d.role,
            d.date,
            d.time,
            d.type,
            d.late ? 'Ya' : 'Tidak',
            d.earlyLeave ? 'Ya' : 'Tidak',
            d.location.split(' (')[0], // Hanya koordinat untuk ringkasan
        ]);
        
        const headers = ['Nama', 'Divisi', 'Role', 'Tanggal', 'Waktu', 'Tipe', 'Terlambat', 'Pulang Cepat', 'Lokasi'];

        if (type === 'pdf') {
            const doc = new jsPDF('landscape');
            doc.text(`Laporan Detail Absensi Tanggal ${filterDate}`, 14, 20);
            doc.text(`Filter: ${filterDivision}`, 14, 26);
            doc.autoTable({
                startY: 30,
                head: [headers],
                body: tableData,
                styles: { fontSize: 7 },
            });
            doc.save(`${fileName}.pdf`);
            showSwal('Ekspor Sukses', 'Laporan Detail Absensi berhasil diekspor sebagai PDF.', 'success', 2000);
            
        } else if (type === 'excel') {
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "AbsensiDetail");
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
            showSwal('Ekspor Sukses', 'Laporan Detail Absensi berhasil diekspor sebagai Excel.', 'success', 2000);
        }
    };
    // --- END FUNGSI EKSPOR ---


    return (
        <GlassCard className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laporan Detail Absensi</h2>
            
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
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
                <div>
                    <PrimaryButton onClick={() => handleExport('pdf')} className="bg-red-500 hover:bg-red-600 mr-2 p-3">
                        <i className="fas fa-file-pdf"></i> PDF
                    </PrimaryButton>
                    <PrimaryButton onClick={() => handleExport('excel')} className="bg-green-500 hover:bg-green-600 p-3">
                        <i className="fas fa-file-excel"></i> Excel
                    </PrimaryButton>
                </div>
            </div>
            
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-yellow-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nama & Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tanggal & Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lokasi (Koordinat)</th>
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
                                    {d.date} <span className="font-semibold text-gray-700">{d.time}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.type === 'Clock In' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {d.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.late || d.earlyLeave ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {d.late ? 'Terlambat' : d.earlyLeave ? 'Pulang Cepat' : 'Tepat Waktu'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                    {d.location.split(' (')[0]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredData.length === 0 && (
                <p className="text-center text-gray-500 mt-4">Tidak ada data absensi untuk kriteria yang dipilih.</p>
            )}
        </GlassCard>
    );
};

export default OwnerAttendanceDetailReport;