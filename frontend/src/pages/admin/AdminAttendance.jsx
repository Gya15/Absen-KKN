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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2">Rekap Absensi</h1>
          <p className="text-primary-300">Data kehadiran peserta KKN</p>
        </div>
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

      <Card className="bg-glass border-glass-border overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-primary-300">
            Tidak ada data absensi ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-primary-100">
              <thead className="bg-surface-lighter/50 text-primary-300 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Foto</th>
                  <th className="px-6 py-4 font-medium">Peserta</th>
                  <th className="px-6 py-4 font-medium">Tanggal/Waktu</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {records.map((record) => (
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
                      <div>{new Date(record.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-sm text-primary-400">{record.waktu_absen}</div>
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
        )}
      </Card>
    </div>
  );
};

export default AdminAttendance;
