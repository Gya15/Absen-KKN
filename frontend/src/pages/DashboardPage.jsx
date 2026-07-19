import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import StatsCard from '../components/ui/StatsCard';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyResponse, todayData] = await Promise.all([
        attendanceService.getHistory().catch(() => null),
        attendanceService.getToday().catch(() => null),
      ]);
      
      const records = historyResponse?.data?.data || historyResponse?.data || [];
      const totalHadir = records.filter(r => r.status === 'Hadir').length;
      const totalTerlambat = records.filter(r => r.status === 'Terlambat').length;
      const totalAbsensi = totalHadir + totalTerlambat;
      
      // Indikator 100% adalah selama 40 hari. Hadir dan Terlambat dihitung masuk.
      const TARGET_HARI_KKN = 40;
      const persentase = Math.min(100, Math.round((totalAbsensi / TARGET_HARI_KKN) * 100));

      setDashboard({
        stats: { total_hadir: totalHadir, total_terlambat: totalTerlambat, total_tidak_hadir: 0, persentase },
        recent: records
      });
      setTodayAttendance(todayData?.data?.attendance || todayData?.attendance || null);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboard?.stats || {};
  const recentHistory = dashboard?.recent || [];

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          {greeting()}, <span className="gradient-text">{user?.nama?.split(' ')[0] || 'User'}</span> 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' • '}
          {currentTime.toLocaleTimeString('id-ID')}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_hadir ?? 0}
            label="Total Hadir"
            color="success"
            delay={0}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_terlambat ?? 0}
            label="Terlambat"
            color="warning"
            delay={100}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_tidak_hadir ?? 0}
            label="Tidak Hadir"
            color="danger"
            delay={200}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            value={`${stats.persentase ?? 0}%`}
            label="Kehadiran"
            color="primary"
            delay={300}
          />
        </div>
      )}

      {/* Today's Attendance Card */}
      <div className="animate-fade-in-up animate-fill-both delay-400">
        <div className={`gradient-border p-6 sm:p-8 ${!todayAttendance ? 'text-center' : ''}`}>
          <div className="relative z-10">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Absensi Hari Ini
            </h2>

            {loading ? (
              <div className="skeleton h-20 w-full" />
            ) : todayAttendance ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {todayAttendance.face_photo && (
                  <img
                    src={todayAttendance.face_photo.startsWith('http') ? todayAttendance.face_photo : `/storage/${todayAttendance.face_photo}`}
                    alt="Foto absen"
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge status={todayAttendance.status || 'Hadir'} />
                    {todayAttendance.similarity_score && (
                      <span className="text-xs text-white/40">
                        Skor: {(todayAttendance.similarity_score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    Waktu absen:{' '}
                    <span className="text-white font-medium">
                      {todayAttendance.waktu || todayAttendance.created_at
                        ? new Date(todayAttendance.waktu || todayAttendance.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center text-primary-400 mx-auto mb-4 animate-pulse-glow">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/50 mb-5">Anda belum melakukan absensi hari ini</p>
                <Link to="/attendance">
                  <button className="btn-primary px-8 py-3 text-base font-semibold animate-pulse-glow rounded-xl">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Absen Sekarang
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {recentHistory.length > 0 && (
        <div className="animate-fade-in-up animate-fill-both delay-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Riwayat Terbaru</h2>
            <Link to="/history" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              Lihat Semua →
            </Link>
          </div>
          <div className="glass-card-static overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentHistory.slice(0, 5).map((record, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-xs font-medium">
                      {new Date(record.tanggal || record.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(record.tanggal || record.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}
                      </p>
                      <p className="text-xs text-white/40">
                        {record.waktu || (record.created_at && new Date(record.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))}
                      </p>
                    </div>
                  </div>
                  <Badge status={record.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
