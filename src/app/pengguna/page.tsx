'use client'; // Menandakan ini halaman interaktif

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function KelolaPengguna() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data saat halaman dibuka
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi saat tombol Reset diklik
  const handleResetPassword = async (userId: number, userName: string) => {
    const newPassword = window.prompt(`Masukkan password baru untuk pelanggan ${userName}:`);
    if (!newPassword) return; // Batal jika kosong

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', newPassword }),
      });
      if (res.ok) {
        alert(`Sukses! Password ${userName} telah diganti menjadi: ${newPassword}`);
      }
    } catch (error) {
      alert("Gagal mereset password");
    }
  };

  // Fungsi saat tombol Banned diklik
  const handleToggleBan = async (userId: number, currentStatus: number, userName: string) => {
    const isCurrentlyBanned = currentStatus === 1;
    const confirmMessage = isCurrentlyBanned 
      ? `Apakah Anda yakin ingin MEMBUKA blokir untuk ${userName}?` 
      : `Apakah Anda yakin ingin MEMBLOKIR ${userName}? Mereka tidak akan bisa login.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_ban', isBanned: !isCurrentlyBanned }),
      });
      
      if (res.ok) {
        alert("Status akun berhasil diperbarui!");
        fetchUsers(); // Refresh tabel setelah diupdate
      }
    } catch (error) {
      alert("Gagal memperbarui status akun");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Pengguna</h1>
            <p className="text-gray-500 mt-1">Daftar akun pelanggan yang terdaftar di SportAja</p>
          </div>
          <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Kembali ke Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Nama & Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-600">No HP</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada pengguna.</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-500">#{user.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{user.name}</div>
                      {user.is_banned === 1 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1 inline-block">Banned</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.phone || '-'}</td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                      >
                        🔑 Reset Password
                      </button>
                      <button 
                        onClick={() => handleToggleBan(user.id, user.is_banned, user.name)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                          user.is_banned === 1 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.is_banned === 1 ? "Buka Blokir" : "Banned"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}