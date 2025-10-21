// src/components/Reporting/SupervisorPerformanceReport.jsx
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../UI/Cards.jsx';
import { PrimaryButton } from '../UI/Buttons.jsx';
import { showSwal } from '../../utils/swal.js';

// --- D4. Laporan Performa Karyawan Supervisor ---
const SupervisorPerformanceReport = ({ employees, setEmployees }) => {
    // Diasumsikan employees adalah tim Supervisor
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || null);
    const [performanceScore, setPerformanceScore] = useState(0);
    const [notes, setNotes] = useState('');

    const selectedEmployee = useMemo(() => 
        employees.find(emp => emp.id === selectedEmployeeId)
    , [employees, selectedEmployeeId]);

    // Update state form saat employee yang dipilih berubah
    React.useEffect(() => {
        if (selectedEmployee) {
            // Gunakan score yang sudah ada, default ke 0
            setPerformanceScore(selectedEmployee.performanceScore || 0);
            setNotes(selectedEmployee.performanceNotes || '');
        } else if (employees.length > 0) {
            // Pilih karyawan pertama jika tidak ada yang terpilih
            setSelectedEmployeeId(employees[0].id);
        }
    }, [selectedEmployee, employees]);
    
    // Handler untuk menyimpan penilaian
    const handleSavePerformance = () => {
        if (!selectedEmployee) {
            showSwal('Gagal', 'Pilih karyawan terlebih dahulu.', 'error');
            return;
        }

        const score = parseInt(performanceScore);
        if (isNaN(score) || score < 0 || score > 100) {
            showSwal('Error', 'Nilai performa harus antara 0 sampai 100.', 'error');
            return;
        }

        // 1. Update state global employees
        const updatedEmployees = employees.map(emp => {
            if (emp.id === selectedEmployee.id) {
                return {
                    ...emp,
                    performanceScore: score, // Tambahkan/update skor performa
                    performanceNotes: notes, // Tambahkan/update catatan
                    lastReviewedBy: 'Supervisor',
                    lastReviewedAt: new Date().toISOString().split('T')[0]
                };
            }
            return emp;
        });

        // 2. Set state
        setEmployees(updatedEmployees);

        showSwal(
            'Sukses!', 
            `Penilaian performa untuk **${selectedEmployee.name}** (${score} poin) berhasil disimpan.`, 
            'success'
        );
    };


    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-chart-line mr-3 text-green-600"></i> Penilaian Performa Karyawan
            </h2>

            <GlassCard>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Kolom Kiri: Daftar Karyawan */}
                    <div className="md:w-1/4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan:</label>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                            {employees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployeeId(emp.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                                        selectedEmployeeId === emp.id 
                                            ? 'bg-blue-600 text-white shadow-md border-blue-700' 
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                                >
                                    <p className="font-semibold">{emp.name}</p>
                                    <p className="text-xs">{emp.division}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kolom Kanan: Form Penilaian */}
                    <div className="md:w-3/4 p-4 border-l border-gray-200">
                        {selectedEmployee ? (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">
                                    Penilaian Performa: {selectedEmployee.name}
                                </h3>

                                {/* Info Performa Sebelumnya */}
                                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800">Skor Saat Ini: 
                                        <span className="text-2xl font-extrabold ml-2">{selectedEmployee.performanceScore || 0}</span> / 100
                                    </p>
                                    {selectedEmployee.lastReviewedAt && (
                                        <p className="text-xs text-yellow-700 mt-1">Terakhir dinilai pada: {selectedEmployee.lastReviewedAt}</p>
                                    )}
                                </div>

                                {/* Form Input */}
                                <div className="space-y-4">
                                    {/* Score */}
                                    <div>
                                        <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Nilai Performa (0-100)</label>
                                        <input
                                            type="number"
                                            id="score"
                                            value={performanceScore}
                                            onChange={(e) => setPerformanceScore(e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan/Feedback</label>
                                        <textarea
                                            id="notes"
                                            rows="5"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tuliskan catatan performa bulanan di sini..."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <PrimaryButton onClick={handleSavePerformance}>
                                            <i className="fas fa-save mr-2"></i> Simpan Penilaian
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 py-20">Silakan pilih karyawan di sebelah kiri untuk mulai memberikan penilaian.</p>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default SupervisorPerformanceReport;