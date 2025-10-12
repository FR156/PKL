// src/utils/constants.js

// Import yang dibutuhkan (jika ada)

// --- CONSTANTS AND UTILITIES (Dipindahkan dari App.jsx) ---

// Definisi Warna
export const COLORS = {
  Primary: '#3B82F6',
  Secondary: '#64748B',
  Success: '#10B981',
  Warning: '#F59E0B',
  Error: '#EF4444',
  Dark: '#1E293B',
  Light: '#F8FAFC'
};

// Data Dummy untuk Simulasi Login
export const DUMMY_AUTH = {
  employee: { id: 101, username: 'karyawan', password: 'password', role: 'employee', name: 'Djob Misael' },
  manager: { id: 201, username: 'manager', password: 'password', role: 'manager', name: 'Ibu Manajer Keren' },
  owner: { id: 301, username: 'owner', password: 'password', role: 'owner', name: 'Pak Owner Perusahaan' },
  supervisor: { id: 401, username: 'supervisor', password: 'password', role: 'supervisor', name: 'Sari Supervisor' }
};



// Data Report Gaji Manajer (Dipindahkan dari import ManagerReports)
export const DUMMY_MANAGER_REPORTS = [
    // --- Salin semua array ManagerReports dari file './DummyPayrollReport' ke sini ---
    { name: 'Jan 2024', totalSalary: 150000000 },
    { name: 'Feb 2024', totalSalary: 155000000 },
    { name: 'Mar 2024', totalSalary: 160000000 },
    { name: 'Apr 2024', totalSalary: 152000000 },
    { name: 'Mei 2024', totalSalary: 165000000 },
    { name: 'Jun 2024', totalSalary: 170000000 },
    { name: 'Jul 2024', totalSalary: 175000000 },
];


// Data Karyawan Awal (Global State)
export const INITIAL_EMPLOYEES = [
    { 
        id: 101, name: 'Djob Misael', division: 'Tech', role: 'employee', joinDate: '2023-01-10',
        cutiBalance: 10, email: 'budi.s@perusahaan.com', phone: '081234567890', status: 'Active',
        currentMonthAttendance: [
            { id: 1, date: '2024-07-01', type: 'Clock In', time: '07:55', location: 'Lat: -6.21, Lon: 106.84', late: false, photo: 'https://i.pravatar.cc/150?img=1' },
            { id: 2, date: '2024-07-01', type: 'Clock Out', time: '17:05', location: 'Lat: -6.21, Lon: 106.84', late: false, photo: 'https://i.pravatar.cc/150?img=2' },
            { id: 3, date: '2024-07-02', type: 'Clock In', time: '08:05', location: 'Lat: -6.21, Lon: 106.84', late: true, photo: 'https://i.pravatar.cc/150?img=3' },
            { id: 4, date: '2024-07-02', type: 'Clock Out', time: '17:00', location: 'Lat: -6.21, Lon: 106.84', late: false, photo: 'https://i.pravatar.cc/150?img=4' },
        ],
        salaryDetails: {
            basic: 6000000, allowance: 1500000, overtimeHours: 10, overtimeRate: 100000, bonus: 500000, deductions: 200000
        },
        attendancePhotos: [ 
            { id: Date.now() + 1, date: '2024-07-01', time: '07:55', type: 'Clock In', photo: 'https://i.pravatar.cc/150?img=1', location: 'Lat: -6.21, Lon: 106.84', employeeId: 101, employeeName: 'Djob Misael', division: 'Tech', employeeEmail: 'budi.s@perusahaan.com', employeePhone: '081234567890' },
            { id: Date.now() + 2, date: '2024-07-01', time: '17:05', type: 'Clock Out', photo: 'https://i.pravatar.cc/150?img=2', location: 'Lat: -6.21, Lon: 106.84', employeeId: 101, employeeName: 'Djob Misael', division: 'Tech', employeeEmail: 'budi.s@perusahaan.com', employeePhone: '081234567890' },
        ]
    },
    { id: 102, name: 'Adi Pratama', division: 'Tech', role: 'employee', cutiBalance: 12, email: 'adi@tech.com', phone: '081111111111', status: 'Active', joinDate: '2023-05-15',
        currentMonthAttendance: [
            { id: 5, date: '2024-07-01', type: 'Clock In', time: '07:58', location: 'Lat: -6.21, Lon: 106.84', late: false, photo: 'https://i.pravatar.cc/150?img=5' },
            { id: 6, date: '2024-07-02', type: 'Clock In', time: '08:01', location: 'Lat: -6.21, Lon: 106.84', late: true, photo: 'https://i.pravatar.cc/150?img=6' },
        ],
        salaryDetails: { basic: 5500000, allowance: 1000000, overtimeHours: 5, overtimeRate: 80000, bonus: 0, deductions: 100000 },
        attendancePhotos: [
            { id: Date.now() + 3, date: '2024-07-01', time: '07:58', type: 'Clock In', photo: 'https://i.pravatar.cc/150?img=5', location: 'Lat: -6.21, Lon: 106.84', employeeId: 102, employeeName: 'Adi Pratama', division: 'Tech', employeeEmail: 'adi@tech.com', employeePhone: '081111111111' },
        ]
    },
    { id: 103, name: 'Bunga Citra', division: 'Marketing', role: 'employee', cutiBalance: 8, email: 'bunga@mkt.com', phone: '082222222222', status: 'Active', joinDate: '2024-01-01',
        currentMonthAttendance: [],
        salaryDetails: { basic: 6200000, allowance: 2000000, overtimeHours: 0, overtimeRate: 120000, bonus: 1000000, deductions: 300000 },
        attendancePhotos: []
    },
    { id: 104, name: 'Charlie Wijaya', division: 'Finance', role: 'employee', cutiBalance: 5, email: 'charlie@fin.com', phone: '083333333333', status: 'Inactive', joinDate: '2022-11-20',
        currentMonthAttendance: [],
        salaryDetails: { basic: 7100000, allowance: 1500000, overtimeHours: 2, overtimeRate: 150000, bonus: 0, deductions: 50000 },
        attendancePhotos: []
    },
];

// Data Manajer Awal
export const INITIAL_MANAGERS = [
    { id: 201, name: 'Ibu Manajer Keren', division: 'General', role: 'manager', email: 'manager@perusahaan.com', phone: '089999999999' },
];

// Data Cuti Pending Awal
export const INITIAL_PENDING_LEAVE = [
    { 
        id: 1, 
        employeeId: 102, 
        name: 'Adi Pratama', 
        type: 'Cuti Tahunan', 
        title: 'Liburan Keluarga',
        startDate: '2024-08-10', 
        endDate: '2024-08-12', 
        days: 3, 
        reason: 'Acara keluarga', 
        status: 'Pending',
        medicalCertificate: null
    },
    { 
        id: 2, 
        employeeId: 104, 
        name: 'Charlie Wijaya', 
        type: 'Izin Sakit', 
        title: 'Sakit Demam',
        startDate: '2024-08-05', 
        endDate: '2024-08-05', 
        days: 1, 
        reason: 'Demam', 
        status: 'Pending',
        medicalCertificate: null
    },
];

// Fungsi Utility (Pindahkan dari App.jsx)
export const calculateTotalSalary = (details) => {
    if (!details) return 0;
    const grossSalary = details.basic + details.allowance + (details.overtimeHours * details.overtimeRate) + details.bonus;
    return grossSalary - details.deductions;
};

export const formattedCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Fungsi kustom untuk menampilkan SweetAlert2 (asumsi Swal sudah di-load di index.html)
export const showSwal = (title, text, icon, timer = 0) => {
  if (typeof Swal !== 'undefined') {
    Swal.fire({ 
      title, 
      html: text, 
      icon, 
      timer: timer > 0 ? timer : undefined,
      showConfirmButton: timer === 0,
      customClass: { 
        popup: 'rounded-xl shadow-lg bg-white',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 rounded-lg py-2 px-4 text-white font-medium',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 rounded-lg py-2 px-4 text-white font-medium ml-2',
      },
      buttonsStyling: false,
    });
  } else {
    console.warn("SweetAlert2 (Swal) is not loaded.");
    alert(`${title}: ${text}`);
  }
};
