import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tanggal_dari: new Date().toISOString().split('T')[0],
    tanggal_sampai: new Date().toISOString().split('T')[0],
    search: ''
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []); // Run once on mount

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAttendance(filters);
      if (res.success && res.data) {
        setRecords(res.data.data || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await adminService.exportExcel(filters);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengekspor data absensi.');
    } finally {
      setExporting(false);
    }
  };

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.tanggal;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {});

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2">Rekap Absensi</h1>
          <p className="text-primary-300">Data kehadiran peserta KKN</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleExport} 
          loading={exporting}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      <Card className="p-6 bg-glass border-glass-border mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-primary-300 mb-1">Cari Nama/NIM</label>
            <input 
              type="text" 
              value={filters.search} 
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
              placeholder="Ketik untuk mencari..."
            />
          </div>
          <div>
            <label className="block text-sm text-primary-300 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={filters.tanggal_dari} 
              onChange={(e) => setFilters({...filters, tanggal_dari: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-primary-300 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={filters.tanggal_sampai} 
              onChange={(e) => setFilters({...filters, tanggal_sampai: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
            />
          </div>
          <Button type="submit" variant="primary">Filter</Button>
        </form>
      </Card>

      {loading ? (
        <Card className="bg-glass border-glass-border overflow-hidden">
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </Card>
      ) : records.length === 0 ? (
        <Card className="bg-glass border-glass-border overflow-hidden">
          <div className="p-12 text-center text-primary-300">
            Tidak ada data absensi ditemukan.
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-glass-border pb-2">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-heading font-semibold text-white">
                  {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <Badge status="Hadir" className="ml-auto opacity-80">
                  {groupedRecords[date].length} Absensi
                </Badge>
              </div>

              <Card className="bg-glass border-glass-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-primary-100">
                    <thead className="bg-surface-lighter/50 text-primary-300 text-sm uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">Foto</th>
                        <th className="px-6 py-4 font-medium">Peserta</th>
                        <th className="px-6 py-4 font-medium">Waktu</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Similarity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {groupedRecords[date].map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            {record.foto_absen_url ? (
                              <img src={record.foto_absen_url} alt="Foto Absen" className="h-12 w-12 object-cover rounded shadow-md" />
                            ) : (
                              <div className="h-12 w-12 bg-surface-lighter rounded flex items-center justify-center text-xs">No img</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{record.user?.nama || 'Unknown'}</div>
                            <div className="text-sm text-primary-400">{record.user?.nim || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{record.waktu_absen}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={record.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="mr-2">{(record.similarity * 100).toFixed(1)}%</span>
                              <div className="w-16 h-2 bg-surface-lighter rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${record.similarity >= 0.8 ? 'bg-success' : 'bg-warning'}`} 
                                  style={{ width: `${Math.min(100, Math.max(0, record.similarity * 100))}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
