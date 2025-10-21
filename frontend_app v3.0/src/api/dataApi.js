import { showSwal } from '../utils/swal';

// Koordinat PT Wilmar Bisnis Medan
const COMPANY_LOCATION = {
  latitude: 3.6206229,
  longitude: 98.7294571,
  name: 'PT Wilmar Bisnis Medan'
};

// Fungsi utama handle absensi karyawan
export const handleAttendanceClock = async (user, type, photoData, workSettings) => {
  try {
    // Ambil waktu & tanggal sekarang
    const now = new Date();
    const date = now.toLocaleDateString('id-ID');
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Deteksi terlambat / pulang cepat
    const startTime = workSettings?.startTime || '08:00';
    const endTime = workSettings?.endTime || '17:00';
    const [hour, minute] = time.split(':').map(Number);
    const currentMinutes = hour * 60 + minute;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = endTime.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    let isLate = false;
    let isEarlyLeave = false;
    let reason = '';

    // Deteksi terlambat untuk Clock In
    if (type === 'In' && currentMinutes > startMinutes) {
      isLate = true;
    }

    // Deteksi pulang cepat untuk Clock Out
    if (type === 'Out' && currentMinutes < endMinutes) {
      isEarlyLeave = true;
    }

    // Buat record absensi
    const newRecord = {
      id: Date.now(),
      userId: user.id,
      name: user.name,
      date,
      time,
      type: type === 'In' ? 'Clock In' : 'Clock Out',
      isLate,
      isEarlyLeave,
      reason,
      location: 'PT Wilmar Bisnis Medan',
      coordinates: `${COMPANY_LOCATION.latitude}, ${COMPANY_LOCATION.longitude}`,
      division: user.division
    };

    // Simpan foto absen
    const newPhotoRecord = {
      id: Date.now(),
      userId: user.id,
      date,
      type: type === 'In' ? 'clock_in' : 'clock_out',
      image: photoData,
      timestamp: now.toISOString()
    };

    // Notifikasi sukses
    showSwal(
      'Berhasil', 
      `Berhasil melakukan ${type === 'In' ? 'Clock In' : 'Clock Out'}!${isLate ? ' (Terlambat)' : ''}${isEarlyLeave ? ' (Pulang Cepat)' : ''}`, 
      'success'
    );

    return { 
      success: true, 
      newRecord, 
      newPhotoRecord,
      isLate,
      isEarlyLeave
    };

  } catch (error) {
    console.error('Error handleAttendanceClock:', error);
    showSwal('Error', 'Gagal melakukan absensi: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan data performa
export const getPerformanceData = (user) => {
  return {
    score: user.performanceScore || 85,
    completedTasks: user.tasks ? user.tasks.filter(task => task.status === 'Completed').length : 0,
    pendingTasks: user.tasks ? user.tasks.filter(task => task.status === 'Pending' || task.status === 'In Progress').length : 0,
    totalTasks: user.tasks ? user.tasks.length : 0,
    targetAchievement: Math.min(100, Math.floor((user.performanceScore || 85) / 85 * 100))
  };
};

// Fungsi untuk mendapatkan riwayat cuti
export const getLeaveHistory = (user) => {
  return user.leaveHistory || [];
};

// Fungsi untuk update profile
export const updateEmployeeProfile = async (employeeId, changes) => {
  try {
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Permintaan perubahan profile berhasil dikirim',
      requestId: Date.now()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Gagal mengirim permintaan perubahan'
    };
  }
};