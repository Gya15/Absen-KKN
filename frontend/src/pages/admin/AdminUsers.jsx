import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data.users || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus peserta ${nama}? Semua data absensi juga akan terhapus.`)) {
      try {
        const res = await adminService.deleteUser(id);
        if (res.success) {
          fetchUsers(); // refresh
        }
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus peserta.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2">Manajemen Peserta</h1>
          <p className="text-primary-300">Kelola data peserta KKN</p>
        </div>
      </div>

      <Card className="bg-glass border-glass-border overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-primary-300">
            Belum ada peserta terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-primary-100">
              <thead className="bg-surface-lighter/50 text-primary-300 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Foto</th>
                  <th className="px-6 py-4 font-medium">NIM</th>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">Jurusan</th>
                  <th className="px-6 py-4 font-medium">Total Kehadiran</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {user.foto_registrasi ? (
                        <img src={`http://localhost:8000/storage/${user.foto_registrasi}`} alt="Foto" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 bg-surface-lighter rounded-full flex items-center justify-center text-xs border border-glass-border">NA</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{user.nim}</td>
                    <td className="px-6 py-4 text-white">{user.nama}</td>
                    <td className="px-6 py-4">{user.jurusan}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
                        {user.attendance_count || 0} kali
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(user.id, user.nama)}>
                        Hapus
                      </Button>
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

export default AdminUsers;
