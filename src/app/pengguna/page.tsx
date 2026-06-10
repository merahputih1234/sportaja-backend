"use client"; // Menandakan ini halaman interaktif

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function KelolaPengguna() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 STATE BARU UNTUK MODAL RESET PASSWORD
  const [resetModalUser, setResetModalUser] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mengambil data saat halaman dibuka
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users', { cache: 'no-store' });
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

  // 🌟 FUNGSI BARU: Eksekusi Reset Password via Modal
  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/users/${resetModalUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', newPassword }),
      });

      if (res.ok) {
        alert(`Sukses! Password akun ${resetModalUser.name} telah berhasil diganti.`);
        setResetModalUser(null); // Tutup modal
        setNewPassword(''); // Bersihkan inputan
      } else {
        alert("Gagal mereset password.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {/* 🟡 MODAL RESET PASSWORD (Hanya muncul jika state resetModalUser ada isinya) */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-purple-600 p-4 text-white font-bold text-lg flex justify-between items-center">
              <span>Reset Password Akun</span>
              <button onClick={() => setResetModalUser(null)} className="text-white hover:text-gray-200">
                ✖
              </button>
            </div>
            
            <form onSubmit={submitResetPassword} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Masukkan password baru untuk pelanggan <strong className="text-gray-800">{resetModalUser.name}</strong>.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ketik password baru di sini..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none text-black transition-shadow"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setResetModalUser(null)} 
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving || !newPassword} 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA HALAMAN */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Pengguna</h1>
            <p className="text-gray-500 mt-1">Daftar akun pelanggan yang terdaftar di SportAja</p>
          </div>
          <Link href="/" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            ⬅ Kembali ke Dashboard
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
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                    <div>Memuat data pelanggan...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Belum ada pengguna yang mendaftar.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-500">#{user.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{user.name}</div>
                      {user.is_banned === 1 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1 inline-block font-semibold border border-red-200">
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.phone || '-'}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          // 🌟 Memicu modal pop-up agar terbuka
                          onClick={() => setResetModalUser({ id: user.id, name: user.name })}
                          className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          🔑 Reset Password
                        </button>
                        <button 
                          onClick={() => handleToggleBan(user.id, user.is_banned, user.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                            user.is_banned === 1 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.is_banned === 1 ? "🔓 Buka Blokir" : "🚫 Banned"}
                        </button>
                      </div>
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