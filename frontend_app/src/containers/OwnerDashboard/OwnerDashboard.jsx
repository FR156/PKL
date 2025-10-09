// src/pages/OwnerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, TabButton, StatCard, PrimaryButton } from '../../components/componentsUtilityUI';
import { formattedCurrency, calculateTotalSalary, showSwal, COLORS } from '../../utils/constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    PieChart,
    Pie,
    Cell as PieCell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Bar
} from 'recharts';

// --- Initialize dummy data if localStorage is empty ---
const initializeDummyData = () => {
    const dummyEmployees = [
        {
            id: 1,
            name: 'John Doe',
            division: 'Tech',
            email: 'john@company.com',
            phone: '08123456789',
            status: 'Active',
            joinDate: '2023-01-15',
            cutiBalance: 12,
            role: 'employee',
            currentMonthAttendance: [],
            attendancePhotos: [],
            salaryDetails: { basic: 8000000, allowance: 2000000, overtimeHours: 0, overtimeRate: 50000, bonus: 0, deductions: 0 },
            nik: '1234567890123456',
            address: 'Jl. Contoh No. 123, Jakarta'
        },
        {
            id: 2,
            name: 'Jane Smith',
            division: 'Marketing',
            email: 'jane@company.com',
            phone: '08234567890',
            status: 'Active',
            joinDate: '2023-02-20',
            cutiBalance: 10,
            role: 'employee',
            currentMonthAttendance: [],
            attendancePhotos: [],
            salaryDetails: { basic: 7000000, allowance: 1500000, overtimeHours: 0, overtimeRate: 45000, bonus: 0, deductions: 0 },
            nik: '2345678901234567',
            address: 'Jl. Contoh No. 456, Jakarta'
        },
        {
            id: 3,
            name: 'Bob Johnson',
            division: 'Finance',
            email: 'bob@company.com',
            phone: '08345678901',
            status: 'Active',
            joinDate: '2023-03-10',
            cutiBalance: 11,
            role: 'employee',
            currentMonthAttendance: [],
            attendancePhotos: [],
            salaryDetails: { basic: 7500000, allowance: 1800000, overtimeHours: 0, overtimeRate: 48000, bonus: 0, deductions: 0 },
            nik: '3456789012345678',
            address: 'Jl. Contoh No. 789, Jakarta'
        }
    ];

    const dummyManagers = [
        {
            id: 1,
            name: 'Alice Manager',
            email: 'alice@company.com',
            status: 'Active',
            role: 'manager',
            nik: '4567890123456789',
            address: 'Jl. Contoh No. 101, Jakarta',
            currentMonthAttendance: [],
            attendancePhotos: []
        },
        {
            id: 2,
            name: 'Charlie Supervisor',
            email: 'charlie@company.com',
            status: 'Active',
            role: 'manager',
            nik: '5678901234567890',
            address: 'Jl. Contoh No. 202, Jakarta',
            currentMonthAttendance: [],
            attendancePhotos: []
        }
    ];

    const dummySupervisors = [
        {
            id: 1,
            name: 'David Supervisor',
            email: 'david@company.com',
            status: 'Active',
            role: 'supervisor',
            nik: '6789012345678901',
            address: 'Jl. Contoh No. 303, Jakarta',
            currentMonthAttendance: [],
            attendancePhotos: []
        }
    ];

    const dummyWorkSettings = {
        startTime: '08:00',
        endTime: '17:00',
        lateDeduction: 50000,
        earlyLeaveDeduction: 75000
    };

    localStorage.setItem('employees', JSON.stringify(dummyEmployees));
    localStorage.setItem('managers', JSON.stringify(dummyManagers));
    localStorage.setItem('supervisors', JSON.stringify(dummySupervisors));
    localStorage.setItem('workSettings', JSON.stringify(dummyWorkSettings));
    
    return { employees: dummyEmployees, managers: dummyManagers, supervisors: dummySupervisors, workSettings: dummyWorkSettings };
};

// --- C1. Ringkasan Dashboard Owner ---
const OwnerSummary = ({ managers, employees, supervisors }) => {
    const totalEmployees = employees.length;
    const totalManagers = managers.length;
    const totalSupervisors = supervisors.length;
    const totalHeadcount = totalEmployees + totalManagers + totalSupervisors;
    const totalMonthlySalary = employees.reduce((sum, emp) => sum + calculateTotalSalary(emp.salaryDetails), 0);

    const dataPie = [
        { name: 'Karyawan', value: totalEmployees, color: COLORS.Success },
        { name: 'Manajer', value: totalManagers, color: COLORS.Primary },
        { name: 'Supervisor', value: totalSupervisors, color: COLORS.Warning },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Headcount" value={totalHeadcount} icon="fas fa-sitemap" color="blue" />
            <StatCard title="Total Karyawan" value={totalEmployees} icon="fas fa-users" color="green" />
            <StatCard title="Total Pengeluaran Gaji" value={formattedCurrency(totalMonthlySalary)} icon="fas fa-wallet" color="red" />

            <GlassCard className="md:col-span-3">
                <h4 className="text-xl font-bold mb-4">Distribusi Peran</h4>
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

            <GlassCard className="md:col-span-3">
                <h4 className="text-xl font-bold mb-4">Rekapitulasi Divisi</h4>
                <div className="flex flex-wrap justify-around">
                    <div className="text-center p-4">
                        <p className="text-3xl font-bold text-blue-600">{employees.filter(e => e.division === 'Tech').length}</p>
                        <p className="text-sm text-gray-600">Tech</p>
                    </div>
                    <div className="text-center p-4">
                        <p className="text-3xl font-bold text-green-600">{employees.filter(e => e.division === 'Marketing').length}</p>
                        <p className="text-sm text-gray-600">Marketing</p>
                    </div>
                    <div className="text-center p-4">
                        <p className="text-3xl font-bold text-red-600">{employees.filter(e => e.division === 'Finance').length}</p>
                        <p className="text-sm text-gray-600">Finance</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// --- C2. Manajemen Karyawan Owner (CRUD) ---
const OwnerEmployeeManagement = ({ employees, setEmployees }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        try {
            if (data.id) {
                // Update existing employee
                const updatedEmployees = employees.map(e => e.id === data.id ? { ...e, ...data } : e);
                setEmployees(updatedEmployees);
                localStorage.setItem('employees', JSON.stringify(updatedEmployees));
                showSwal('Berhasil!', 'Data karyawan berhasil diperbarui.', 'success', 2000);
            } else {
                // Add new employee
                const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
                const newEmployee = {
                    ...data,
                    id: newId,
                    role: 'employee',
                    currentMonthAttendance: [],
                    attendancePhotos: [],
                    salaryDetails: { 
                        basic: 5000000, 
                        allowance: 1000000, 
                        overtimeHours: 0, 
                        overtimeRate: 50000, 
                        bonus: 0, 
                        deductions: 0 
                    }
                };
                const updatedEmployees = [...employees, newEmployee];
                setEmployees(updatedEmployees);
                localStorage.setItem('employees', JSON.stringify(updatedEmployees));
                showSwal('Berhasil!', 'Karyawan baru berhasil ditambahkan.', 'success', 2000);
            }
            setIsModalOpen(false);
            setCurrentEmployee(null);
        } catch (error) {
            console.error('Error saving employee:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menyimpan data karyawan.', 'error', 2000);
        }
    };

    const handleDelete = (id, name) => {
        try {
            if (window.confirm(`Yakin ingin menghapus karyawan ${name}?`)) {
                const updatedEmployees = employees.filter(e => e.id !== id);
                setEmployees(updatedEmployees);
                localStorage.setItem('employees', JSON.stringify(updatedEmployees));
                showSwal('Dihapus!', `Karyawan ${name} telah dihapus.`, 'warning', 2000);
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menghapus data karyawan.', 'error', 2000);
        }
    };

    const openAddModal = () => {
        setCurrentEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setCurrentEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEmployee(null);
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Karyawan</h3>
            <div className="flex justify-between items-center mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Cari nama, divisi, atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <PrimaryButton onClick={openAddModal}>
                    <i className="fas fa-plus mr-2"></i> Tambah Karyawan
                </PrimaryButton>
            </div>

            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    {searchTerm ? 'Tidak ada data karyawan yang cocok dengan pencarian.' : 'Belum ada data karyawan.'}
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.nik}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.division}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <PrimaryButton 
                                            onClick={() => openEditModal(emp)} 
                                            className="bg-yellow-500 hover:bg-yellow-600 py-1 px-2"
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </PrimaryButton>
                                        <PrimaryButton 
                                            onClick={() => handleDelete(emp.id, emp.name)} 
                                            className="bg-red-500 hover:bg-red-600 py-1 px-2"
                                        >
                                            <i className="fas fa-trash"></i> Hapus
                                        </PrimaryButton>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                employeeData={currentEmployee}
                onSave={handleSave}
            />
        </GlassCard>
    );
};

// --- Employee Modal Component ---
const EmployeeModal = ({ isOpen, onClose, employeeData, onSave }) => {
    const [data, setData] = useState({
        name: '',
        division: 'Tech',
        email: '',
        phone: '',
        nik: '',
        address: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        cutiBalance: 12
    });

    useEffect(() => {
        if (employeeData) {
            setData(employeeData);
        } else {
            setData({
                name: '',
                division: 'Tech',
                email: '',
                phone: '',
                nik: '',
                address: '',
                status: 'Active',
                joinDate: new Date().toISOString().split('T')[0],
                cutiBalance: 12
            });
        }
    }, [employeeData, isOpen]);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.name || !data.division || !data.email || !data.nik) {
            showSwal('Error!', 'Nama, divisi, email, dan NIK harus diisi.', 'error', 2000);
            return;
        }
        
        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
            <GlassCard className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-xl font-bold mb-4">{employeeData ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Nama Lengkap" 
                        value={data.name} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                        type="text" 
                        name="nik" 
                        placeholder="NIK" 
                        value={data.nik} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <select 
                        name="division" 
                        value={data.division} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tech">Tech</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                    </select>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={data.email} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                        type="tel" 
                        name="phone" 
                        placeholder="Nomor Telepon" 
                        value={data.phone} 
                        onChange={handleChange} 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                        type="text" 
                        name="address" 
                        placeholder="Alamat" 
                        value={data.address} 
                        onChange={handleChange} 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <select 
                        name="status" 
                        value={data.status} 
                        onChange={handleChange} 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <input 
                        type="date" 
                        name="joinDate" 
                        value={data.joinDate} 
                        onChange={handleChange} 
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                        type="number" 
                        name="cutiBalance" 
                        placeholder="Jatah Cuti" 
                        value={data.cutiBalance} 
                        onChange={handleChange} 
                        required 
                        min="0"
                        className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <PrimaryButton 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-500 hover:bg-gray-600"
                        >
                            Batal
                        </PrimaryButton>
                        <PrimaryButton type="submit">
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

// --- C3. Manajemen Manajer dan Supervisor Owner (CRUD) ---
const OwnerManagerManagement = ({ managers, setManagers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentManager, setCurrentManager] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredManagers = managers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        try {
            if (data.id) {
                const updatedManagers = managers.map(m => m.id === data.id ? { ...m, ...data } : m);
                setManagers(updatedManagers);
                localStorage.setItem('managers', JSON.stringify(updatedManagers));
                showSwal('Berhasil!', 'Data manajer berhasil diperbarui.', 'success', 2000);
            } else {
                const newId = managers.length > 0 ? Math.max(...managers.map(m => m.id)) + 1 : 1;
                const newManager = { 
                    ...data, 
                    id: newId, 
                    role: 'manager',
                    currentMonthAttendance: [],
                    attendancePhotos: []
                };
                const updatedManagers = [...managers, newManager];
                setManagers(updatedManagers);
                localStorage.setItem('managers', JSON.stringify(updatedManagers));
                showSwal('Berhasil!', 'Manajer baru berhasil ditambahkan.', 'success', 2000);
            }
            setIsModalOpen(false);
            setCurrentManager(null);
        } catch (error) {
            console.error('Error saving manager:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menyimpan data manajer.', 'error', 2000);
        }
    };

    const handleDelete = (id, name) => {
        try {
            if (window.confirm(`Yakin ingin menghapus manajer ${name}?`)) {
                const updatedManagers = managers.filter(m => m.id !== id);
                setManagers(updatedManagers);
                localStorage.setItem('managers', JSON.stringify(updatedManagers));
                showSwal('Dihapus!', `Manajer ${name} telah dihapus.`, 'warning', 2000);
            }
        } catch (error) {
            console.error('Error deleting manager:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menghapus data manajer.', 'error', 2000);
        }
    };

    const ManagerModal = ({ isOpen, onClose, managerData, onSave }) => {
        const [data, setData] = useState({ 
            name: '', 
            email: '', 
            phone: '',
            nik: '',
            address: '',
            status: 'Active' 
        });
        
        useEffect(() => {
            if (managerData) {
                setData(managerData);
            } else {
                setData({ 
                    name: '', 
                    email: '', 
                    phone: '',
                    nik: '',
                    address: '',
                    status: 'Active' 
                });
            }
        }, [managerData, isOpen]);
        
        const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
        const handleSubmit = (e) => { 
            e.preventDefault(); 
            
            if (!data.name || !data.email || !data.nik) {
                showSwal('Error!', 'Nama, email, dan NIK harus diisi.', 'error', 2000);
                return;
            }
            
            onSave(data); 
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <GlassCard className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-xl font-bold mb-4">{managerData ? 'Edit Manajer' : 'Tambah Manajer Baru'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Nama Lengkap" 
                            value={data.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                            type="text" 
                            name="nik" 
                            placeholder="NIK" 
                            value={data.nik} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            value={data.email} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder="Nomor Telepon" 
                            value={data.phone} 
                            onChange={handleChange} 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                            type="text" 
                            name="address" 
                            placeholder="Alamat" 
                            value={data.address} 
                            onChange={handleChange} 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <select 
                            name="status" 
                            value={data.status} 
                            onChange={handleChange} 
                            className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <div className="flex justify-end space-x-2 pt-2">
                            <PrimaryButton 
                                type="button" 
                                onClick={onClose} 
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Batal
                            </PrimaryButton>
                            <PrimaryButton type="submit">
                                Simpan
                            </PrimaryButton>
                        </div>
                    </form>
                </GlassCard>
            </div>
        );
    };

    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Manajer</h3>
            <div className="flex justify-between items-center mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <PrimaryButton onClick={() => setIsModalOpen(true)}>
                    <i className="fas fa-plus mr-2"></i> Tambah Manajer
                </PrimaryButton>
            </div>
            <div className="space-y-3">
                {filteredManagers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Tidak ada data manajer yang cocok dengan pencarian.' : 'Belum ada data manajer.'}
                    </p>
                ) : (
                    filteredManagers.map(m => (
                        <div key={m.id} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{m.name}</p>
                                <p className="text-sm text-gray-500">{m.email}</p>
                                <p className="text-sm text-gray-500">NIK: {m.nik}</p>
                            </div>
                            <div className="space-x-2">
                                <PrimaryButton 
                                    onClick={() => { setCurrentManager(m); setIsModalOpen(true); }} 
                                    className="bg-yellow-500 hover:bg-yellow-600 py-1 px-2"
                                >
                                    <i className="fas fa-edit"></i> Edit
                                </PrimaryButton>
                                <PrimaryButton 
                                    onClick={() => handleDelete(m.id, m.name)} 
                                    className="bg-red-500 hover:bg-red-600 py-1 px-2"
                                >
                                    <i className="fas fa-trash"></i> Hapus
                                </PrimaryButton>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <ManagerModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCurrentManager(null); }}
                managerData={currentManager}
                onSave={handleSave}
            />
        </GlassCard>
    );
};

// --- C4. Laporan Kehadiran Selfie Karyawan ---
const OwnerAttendanceReport = ({ employees, managers, supervisors }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const allPhotos = [
        ...employees.flatMap(emp => emp.attendancePhotos || []),
        ...managers.flatMap(mgr => mgr.attendancePhotos || []),
        ...supervisors.flatMap(sup => sup.attendancePhotos || [])
    ];

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
                <p className="text-gray-600 mb-4">Foto absensi terbaru dari seluruh karyawan, manajer, dan supervisor.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
                    {allPhotos.length === 0 && <p className="text-center py-8 text-gray-500 col-span-full">Belum ada data foto absensi.</p>}
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
                                    <p><span className="font-medium">Role:</span> {selectedPhoto.role}</p>
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
const OwnerSupervisorManagement = ({ supervisors, setSupervisors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupervisor, setCurrentSupervisor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSupervisors = supervisors.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        try {
            if (data.id) {
                // Edit existing supervisor
                const updatedSupervisors = supervisors.map(s => s.id === data.id ? { ...s, ...data } : s);
                setSupervisors(updatedSupervisors);
                localStorage.setItem('supervisors', JSON.stringify(updatedSupervisors));
                showSwal('Berhasil!', 'Data supervisor berhasil diperbarui.', 'success', 2000);
            } else {
                // Tambah supervisor baru
                const newId = supervisors.length > 0 ? Math.max(...supervisors.map(s => s.id)) + 1 : 1;
                const newSupervisor = { 
                    ...data, 
                    id: newId, 
                    role: 'supervisor',
                    currentMonthAttendance: [],
                    attendancePhotos: []
                };
                const updatedSupervisors = [...supervisors, newSupervisor];
                setSupervisors(updatedSupervisors);
                localStorage.setItem('supervisors', JSON.stringify(updatedSupervisors));
                showSwal('Berhasil!', 'Supervisor baru berhasil ditambahkan.', 'success', 2000);
            }
            setIsModalOpen(false);
            setCurrentSupervisor(null);
        } catch (error) {
            console.error('Error saving supervisor:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menyimpan data supervisor.', 'error', 2000);
        }
    };

    const handleDelete = (id, name) => {
        try {
            if (window.confirm(`Yakin ingin menghapus supervisor ${name}?`)) {
                const updatedSupervisors = supervisors.filter(s => s.id !== id);
                setSupervisors(updatedSupervisors);
                localStorage.setItem('supervisors', JSON.stringify(updatedSupervisors));
                showSwal('Dihapus!', `Supervisor ${name} telah dihapus.`, 'warning', 2000);
            }
        } catch (error) {
            console.error('Error deleting supervisor:', error);
            showSwal('Error!', 'Terjadi kesalahan saat menghapus data supervisor.', 'error', 2000);
        }
    };

    const SupervisorModal = ({ isOpen, onClose, supervisorData, onSave }) => {
        const [data, setData] = useState({ 
            name: '', 
            email: '', 
            phone: '',
            nik: '',
            address: '',
            status: 'Active' 
        });

        useEffect(() => {
            if (supervisorData) setData(supervisorData);
            else setData({ name: '', email: '', phone: '', nik: '', address: '', status: 'Active' });
        }, [supervisorData, isOpen]);

        const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!data.name || !data.email || !data.nik) {
                showSwal('Error!', 'Nama, email, dan NIK harus diisi.', 'error', 2000);
                return;
            }
            onSave(data);
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <GlassCard className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-xl font-bold mb-4">{supervisorData ? 'Edit Supervisor' : 'Tambah Supervisor Baru'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input type="text" name="name" placeholder="Nama Lengkap" value={data.name} onChange={handleChange} required className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="nik" placeholder="NIK" value={data.nik} onChange={handleChange} required className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleChange} required className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="tel" name="phone" placeholder="Nomor Telepon" value={data.phone} onChange={handleChange} className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="address" placeholder="Alamat" value={data.address} onChange={handleChange} className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <select name="status" value={data.status} onChange={handleChange} className="w-full p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Supervisor</h3>
            <div className="flex justify-between items-center mb-4 space-x-2">
                <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <PrimaryButton onClick={() => setIsModalOpen(true)}><i className="fas fa-plus mr-2"></i> Tambah Supervisor</PrimaryButton>
            </div>
            <div className="space-y-3">
                {filteredSupervisors.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">{searchTerm ? 'Tidak ada data supervisor yang cocok dengan pencarian.' : 'Belum ada data supervisor.'}</p>
                ) : (
                    filteredSupervisors.map(s => (
                        <div key={s.id} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{s.name}</p>
                                <p className="text-sm text-gray-500">{s.email}</p>
                                <p className="text-sm text-gray-500">NIK: {s.nik}</p>
                            </div>
                            <div className="space-x-2">
                                <PrimaryButton onClick={() => { setCurrentSupervisor(s); setIsModalOpen(true); }} className="bg-yellow-500 hover:bg-yellow-600 py-1 px-2"><i className="fas fa-edit"></i> Edit</PrimaryButton>
                                <PrimaryButton onClick={() => handleDelete(s.id, s.name)} className="bg-red-500 hover:bg-red-600 py-1 px-2"><i className="fas fa-trash"></i> Hapus</PrimaryButton>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <SupervisorModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentSupervisor(null); }} supervisorData={currentSupervisor} onSave={handleSave} />
        </GlassCard>
    );
};

// --- C5. Laporan Gaji ---
const OwnerPayrollReport = ({ employees }) => {
   const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Laporan Gaji Bulanan', 14, 15);

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

    autoTable(doc, {
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
                'Divisi': emp.division,
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

    const totalMonthlySalary = employees.reduce((sum, emp) => sum + calculateTotalSalary(emp.salaryDetails), 0);

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
            
            <div className="p-4 bg-blue-100 rounded-lg mb-4 flex justify-between items-center">
                <span className="text-lg font-bold text-blue-800">Total Pengeluaran Gaji Bulanan</span>
                <span className="text-3xl font-extrabold text-blue-800">{formattedCurrency(totalMonthlySalary)}</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Pokok</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tunjangan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lembur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potongan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map(emp => {
                            const details = emp.salaryDetails;
                            const totalSalary = calculateTotalSalary(details);
                            return (
                                <tr key={emp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.division}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedCurrency(details.basic)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedCurrency(details.allowance)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedCurrency(details.overtimeHours * details.overtimeRate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedCurrency(details.bonus)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedCurrency(details.deductions)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formattedCurrency(totalSalary)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};
// --- C6. Laporan Detail Kehadiran Karyawan ---
const OwnerAttendanceDetailReport = ({ employees, managers, supervisors }) => {
    // === Dummy Data Fallback ===
    employees = employees || [
        { id: 1, name: 'Ardi Putra', role: 'Employee', division: 'Tech', email: 'ardi@example.com', currentMonthAttendance: [] },
        { id: 2, name: 'Rina Dewi', role: 'Employee', division: 'Marketing', email: 'rina@example.com', currentMonthAttendance: [] },
    ];
    managers = managers || [
        { id: 101, name: 'Budi Santoso', role: 'Manager', division: 'Tech', email: 'budi@example.com', currentMonthAttendance: [] }
    ];
    supervisors = supervisors || [
        { id: 201, name: 'Sari Lestari', role: 'Supervisor', division: 'Finance', email: 'sari@example.com', currentMonthAttendance: [] }
    ];

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    const allStaff = [...employees, ...managers, ...supervisors];

    const filteredStaff = allStaff.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.division?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === Export PDF fix ===
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Laporan Kehadiran ${new Date(selectedYear, selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`, 14, 15);

        const tableData = filteredStaff.map(staff => {
            const monthYear = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
            const attendanceRecords = (staff.currentMonthAttendance || []).filter(record => record.date.startsWith(monthYear));
            const clockInRecords = attendanceRecords.filter(r => r.type === 'Clock In');
            const clockOutRecords = attendanceRecords.filter(r => r.type === 'Clock Out');
            const lateRecords = clockInRecords.filter(r => r.late);

            return [
                staff.name,
                staff.role,
                staff.division || '-',
                clockInRecords.length,
                clockOutRecords.length,
                lateRecords.length,
                `${clockInRecords.length} hari`
            ];
        });

        autoTable(doc, {
            head: [['Nama', 'Role', 'Divisi', 'Hadir', 'Pulang', 'Terlambat', 'Total Kehadiran']],
            body: tableData,
            startY: 25,
        });

        doc.save(`laporan_kehadiran_${new Date(selectedYear, selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.pdf`);
    };

    // === Export Excel ===
    const exportToExcel = () => {
        const data = filteredStaff.map(staff => {
            const monthYear = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
            const attendanceRecords = (staff.currentMonthAttendance || []).filter(record => record.date.startsWith(monthYear));
            const clockInRecords = attendanceRecords.filter(r => r.type === 'Clock In');
            const clockOutRecords = attendanceRecords.filter(r => r.type === 'Clock Out');
            const lateRecords = clockInRecords.filter(r => r.late);

            return {
                'Nama': staff.name,
                'Role': staff.role,
                'Divisi': staff.division || '-',
                'Hadir': clockInRecords.length,
                'Pulang': clockOutRecords.length,
                'Terlambat': lateRecords.length,
                'Total Kehadiran': `${clockInRecords.length} hari`
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kehadiran');
        XLSX.writeFile(wb, `laporan_kehadiran_${new Date(selectedYear, selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.xlsx`);
    };

    return (
        <GlassCard className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h3>
                <div className="flex space-x-2">
                    <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i className="fas fa-file-pdf mr-2"></i> Export PDF
                    </button>
                    <button onClick={exportToExcel} className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i className="fas fa-file-excel mr-2"></i> Export Excel
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="p-2 border rounded-lg">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="p-2 border rounded-lg w-24"/>
                </div>
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                    <input type="text" placeholder="Nama, divisi, atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-lg"/>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terlambat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Kehadiran</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStaff.map(staff => {
                            const monthYear = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                            const attendanceRecords = (staff.currentMonthAttendance || []).filter(record => record.date.startsWith(monthYear));
                            const clockInRecords = attendanceRecords.filter(r => r.type === 'Clock In');
                            const clockOutRecords = attendanceRecords.filter(r => r.type === 'Clock Out');
                            const lateRecords = clockInRecords.filter(r => r.late);

                            return (
                                <tr key={staff.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.division || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clockInRecords.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clockOutRecords.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lateRecords.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clockInRecords.length} hari</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

// --- C7. Target Bulanan Karyawan ---
const OwnerMonthlyTarget = () => {
    // --- DUMMY DATA EMPLOYEES ---
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Ardi Putra', division: 'Tech', monthlyTargets: [] },
        { id: 2, name: 'Rina Sari', division: 'Marketing', monthlyTargets: [] },
        { id: 3, name: 'Dedi Santoso', division: 'Finance', monthlyTargets: [] },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [division, setDivision] = useState('Tech');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile({
                    name: selectedFile.name,
                    type: selectedFile.type,
                    data: reader.result
                });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !description || !deadline) {
            showSwal('Error!', 'Judul, deskripsi, dan deadline harus diisi.', 'error', 2000);
            return;
        }

        const newTarget = {
            id: Date.now(),
            division,
            title,
            description,
            deadline,
            file,
            status: 'Active',
            createdBy: 'Owner',
            createdDate: new Date().toISOString()
        };

        // Add target ke semua employee di divisi tertentu
        const updatedEmployees = employees.map(emp => {
            if (emp.division === division) {
                return {
                    ...emp,
                    monthlyTargets: [...(emp.monthlyTargets || []), newTarget]
                };
            }
            return emp;
        });

        setEmployees(updatedEmployees);

        // Reset form
        setTitle('');
        setDescription('');
        setDeadline('');
        setFile(null);
        setIsModalOpen(false);

        showSwal('Berhasil!', `Target bulanan untuk divisi ${division} telah ditetapkan.`, 'success', 2000);
    };

    return (
        <>
            <GlassCard className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Target Bulanan</h3>
                    <PrimaryButton onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus mr-2"></i> Tambah Target
                    </PrimaryButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {['Tech', 'Marketing', 'Finance'].map((div, idx) => (
                        <StatCard 
                            key={idx}
                            title={`Target ${div}`} 
                            value={`${employees.filter(e => e.division === div && e.monthlyTargets?.length > 0).length} karyawan`} 
                            icon="fas fa-bullseye" 
                            color={div === 'Tech' ? 'blue' : div === 'Marketing' ? 'green' : 'red'} 
                        />
                    ))}
                </div>

                <div className="space-y-4">
                    {employees.map(emp => (
                        emp.monthlyTargets?.length > 0 && (
                            <div key={emp.id} className="p-4 border rounded-lg bg-white">
                                <h4 className="font-semibold text-lg mb-2">{emp.name} - {emp.division}</h4>
                                <div className="space-y-2">
                                    {emp.monthlyTargets.map(target => (
                                        <div key={target.id} className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium">{target.title}</h5>
                                                <p className="text-sm text-gray-600 mt-1">{target.description}</p>
                                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                                    <i className="fas fa-calendar-alt mr-1"></i>
                                                    <span>Deadline: {target.deadline}</span>
                                                </div>
                                                {target.file && (
                                                    <div className="mt-2">
                                                        <a 
                                                            href={target.file.data} 
                                                            download={target.file.name}
                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                        >
                                                            <i className="fas fa-paperclip mr-1"></i>
                                                            {target.file.name}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                target.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {target.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </GlassCard>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <GlassCard className="w-full max-w-md">
                        <h4 className="text-xl font-bold mb-4">Tambah Target Bulanan</h4>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                                <select
                                    value={division}
                                    onChange={(e) => setDivision(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="Tech">Tech</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Target</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Contoh: Peningkatan Penjualan 20%"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    rows="4"
                                    placeholder="Deskripsi detail target yang harus dicapai..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen (Opsional)</label>
                                <div className="flex items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <i className="fas fa-upload mr-2"></i> Upload Dokumen
                                    </button>
                                    {file && <span className="ml-3 text-sm text-gray-500">{file.name}</span>}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <PrimaryButton 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="bg-gray-500 hover:bg-gray-600"
                                >
                                    Batal
                                </PrimaryButton>
                                <PrimaryButton type="submit">
                                    Simpan
                                </PrimaryButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </>
    );
};
// --- C8. Performa Karyawan ---
const OwnerEmployeePerformance = ({ employees, managers, supervisors }) => {
    const [selectedRole, setSelectedRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const allStaff = [...employees, ...managers, ...supervisors];
    
    const filteredStaff = allStaff.filter(staff => {
        const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            staff.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            staff.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });
    
    // Calculate performance score for each staff
    const staffWithPerformance = filteredStaff.map(staff => {
        // Get attendance data
        const attendanceRecords = staff.currentMonthAttendance || [];
        const totalDays = new Date().getDate(); // Current day of month
        const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
        const attendanceScore = (presentDays / totalDays) * 50; // 50% of score from attendance
        
        // Get tasks data
        const tasks = staff.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalTasks = tasks.length || 1; // Avoid division by zero
        const taskScore = (completedTasks / totalTasks) * 50; // 50% of score from tasks
        
        const performanceScore = Math.round(attendanceScore + taskScore);
        
        return {
            ...staff,
            performanceScore
        };
    }).sort((a, b) => b.performanceScore - a.performanceScore); // Sort by performance score (highest first)
    
    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Performa Karyawan</h3>
            
            <div className="flex flex-wrap gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="p-2 border rounded-lg"
                    >
                        <option value="all">Semua</option>
                        <option value="employee">Karyawan</option>
                        <option value="manager">Manajer</option>
                        <option value="supervisor">Supervisor</option>
                    </select>
                </div>
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                    <input
                        type="text"
                        placeholder="Nama, divisi, atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kehadiran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tugas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Performa</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staffWithPerformance.map(staff => {
                            const attendanceRecords = staff.currentMonthAttendance || [];
                            const presentDays = attendanceRecords.filter(r => r.type === 'Clock In').length;
                            const totalDays = new Date().getDate();
                            const attendancePercentage = Math.round((presentDays / totalDays) * 100);
                            
                            const tasks = staff.tasks || [];
                            const completedTasks = tasks.filter(t => t.status === 'Completed').length;
                            const totalTasks = tasks.length || 1;
                            const taskPercentage = Math.round((completedTasks / totalTasks) * 100);
                            
                            return (
                                <tr key={staff.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.division || '-'}</td>
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
                                            staff.performanceScore >= 80 ? 'bg-green-100 text-green-800' : 
                                            staff.performanceScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {staff.performanceScore}/100
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

// --- C9. Work Settings ---
const OwnerWorkSettings = ({ workSettings, setWorkSettings }) => {
    const [startTime, setStartTime] = useState(workSettings.startTime);
    const [endTime, setEndTime] = useState(workSettings.endTime);
    const [lateDeduction, setLateDeduction] = useState(workSettings.lateDeduction);
    const [earlyLeaveDeduction, setEarlyLeaveDeduction] = useState(workSettings.earlyLeaveDeduction);
    
    const handleSave = () => {
        const newSettings = {
            startTime,
            endTime,
            lateDeduction: parseInt(lateDeduction),
            earlyLeaveDeduction: parseInt(earlyLeaveDeduction)
        };
        
        setWorkSettings(newSettings);
        localStorage.setItem('workSettings', JSON.stringify(newSettings));
        showSwal('Berhasil!', 'Pengaturan jam kerja berhasil diperbarui.', 'success', 2000);
    };
    
    return (
        <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pengaturan Jam Kerja</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potongan Keterlambatan (Rp)</label>
                    <input
                        type="number"
                        value={lateDeduction}
                        onChange={(e) => setLateDeduction(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potongan Pulang Awal (Rp)</label>
                    <input
                        type="number"
                        value={earlyLeaveDeduction}
                        onChange={(e) => setEarlyLeaveDeduction(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
            </div>
            
            <div className="mt-4">
                <PrimaryButton onClick={handleSave}>
                    <i className="fas fa-save mr-2"></i> Simpan Pengaturan
                </PrimaryButton>
            </div>
        </GlassCard>
    );
};

// --- OWNER DASHBOARD WRAPPER ---
const OwnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [workSettings, setWorkSettings] = useState({});

    // Initialize data from localStorage or create dummy data
    useEffect(() => {
        const storedEmployees = localStorage.getItem('employees');
        const storedManagers = localStorage.getItem('managers');
        const storedSupervisors = localStorage.getItem('supervisors');
        const storedWorkSettings = localStorage.getItem('workSettings');
        
        if (storedEmployees && storedManagers && storedSupervisors && storedWorkSettings) {
            setEmployees(JSON.parse(storedEmployees));
            setManagers(JSON.parse(storedManagers));
            setSupervisors(JSON.parse(storedSupervisors));
            setWorkSettings(JSON.parse(storedWorkSettings));
        } else {
            const { employees: dummyEmployees, managers: dummyManagers, supervisors: dummySupervisors, workSettings: dummyWorkSettings } = initializeDummyData();
            setEmployees(dummyEmployees);
            setManagers(dummyManagers);
            setSupervisors(dummySupervisors);
            setWorkSettings(dummyWorkSettings);
        }
    }, []);

    return (
        <div className="py-4">
            <div className="flex space-x-3 overflow-x-auto mb-6 pb-2">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
                    <i className="fas fa-chart-line mr-2"></i> Ringkasan
                </TabButton>
                <TabButton isActive={activeTab === 'emp'} onClick={() => setActiveTab('emp')}>
                    <i className="fas fa-users mr-2"></i> Karyawan
                </TabButton>
                <TabButton isActive={activeTab === 'manager'} onClick={() => setActiveTab('manager')}>
                    <i className="fas fa-user-tie mr-2"></i> Manajer
                </TabButton>
                <TabButton isActive={activeTab === 'supervisor'} onClick={() => setActiveTab('supervisor')}>
                    <i className="fas fa-user-check mr-2"></i> Supervisor
                </TabButton>
                <TabButton isActive={activeTab === 'target'} onClick={() => setActiveTab('target')}>
                    <i className="fas fa-bullseye mr-2"></i> Target Bulanan
                </TabButton>
                <TabButton isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                    <i className="fas fa-chart-line mr-2"></i> Performa
                </TabButton>
                <TabButton isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')}>
                    <i className="fas fa-file-invoice-dollar mr-2"></i> Laporan Gaji
                </TabButton>
                <TabButton isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
                    <i className="fas fa-clock mr-2"></i> Laporan Kehadiran
                </TabButton>
                <TabButton isActive={activeTab === 'report'} onClick={() => setActiveTab('report')}>
                    <i className="fas fa-camera mr-2"></i> Laporan Selfie
                </TabButton>
                <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                    <i className="fas fa-cog mr-2"></i> Pengaturan
                </TabButton>
            </div>

            {activeTab === 'summary' && <OwnerSummary managers={managers} employees={employees} supervisors={supervisors} />}
            {activeTab === 'emp' && <OwnerEmployeeManagement employees={employees} setEmployees={setEmployees} />}
            {activeTab === 'manager' && <OwnerManagerManagement managers={managers} setManagers={setManagers} />}
            {activeTab === 'supervisor' && <OwnerSupervisorManagement supervisors={supervisors}setSupervisors={setSupervisors} />}
            {activeTab === 'target' && <OwnerMonthlyTarget employees={employees} setEmployees={setEmployees} />}
            {activeTab === 'performance' && <OwnerEmployeePerformance employees={employees} managers={managers} supervisors={supervisors} />}
            {activeTab === 'payroll' && <OwnerPayrollReport employees={employees} />}
            {activeTab === 'attendance' && <OwnerAttendanceDetailReport employees={employees} managers={managers} supervisors={supervisors} />}
            {activeTab === 'report' && <OwnerAttendanceReport employees={employees} managers={managers} supervisors={supervisors} />}
            {activeTab === 'settings' && <OwnerWorkSettings workSettings={workSettings} setWorkSettings={setWorkSettings} />}
        </div>
    );
};

export default OwnerDashboard;