import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import attendanceService from '../services/attendanceService';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await attendanceService.getHistory();
        if (response.success && response.data) {
          setHistory(response.data.data || response.data); // Handle pagination structure if any
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Gagal memuat riwayat absensi.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-white mb-6">Riwayat Absensi</h1>

      <Card className="bg-glass border-glass-border overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">{error}</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-primary-300">
            Belum ada riwayat absensi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-primary-100">
              <thead className="bg-surface-lighter/50 text-primary-300 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Waktu</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {history.map((record, index) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">
                      {new Date(record.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{record.waktu_absen}</td>
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

export default HistoryPage;
