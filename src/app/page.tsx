"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Venue {
  id: number;
  name: string;
  category: string;
  address: string;
  price_per_hour: string;
  image_url: string | null;
}

export default function Dashboard() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    category: 'Futsal',
    address: '',
    price_per_hour: '',
    image_url: ''
  });

  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/venues', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Gagal memuat data`);
      const data = await res.json();
      setVenues(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus lapangan "${name}" secara permanen?`);
    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/venues', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("Data berhasil dihapus!");
        fetchVenues(); 
      } else {
        alert(`Gagal menghapus data: ${data?.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;

    try {
      setIsSaving(true);
      const res = await fetch('/api/venues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVenue),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("Data berhasil diperbarui!");
        setEditingVenue(null); 
        fetchVenues(); 
      } else {
        alert(`Gagal memperbarui: ${data?.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenue),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("Lapangan baru berhasil ditambahkan!");
        setIsAddingVenue(false); 
        setNewVenue({ name: '', category: 'Futsal', address: '', price_per_hour: '', image_url: '' }); 
        fetchVenues(); 
      } else {
        // 🔥 FITUR ERROR CATCHER: Jika link kepanjangan, Aiven akan jujur di sini!
        alert(`Gagal menambahkan: ${data?.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupiah = (priceStr: string) => {
    if (!priceStr) return "Rp 0";
    const numericPrice = parseInt(String(priceStr).split(".")[0]);
    const cleanPrice = isNaN(numericPrice) ? 0 : numericPrice;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(cleanPrice);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* 🔵 MODAL TAMBAH LAPANGAN */}
      {isAddingVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 p-4 text-white font-bold text-lg sticky top-0">Tambah Lapangan Baru</div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama GOR/Lapangan</label>
                <input 
                  type="text" required 
                  placeholder="Misal: GOR Satria"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={newVenue.name} 
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar Lapangan</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
                  placeholder="https://contoh.com/gambar.jpg"
                  value={newVenue.image_url} 
                  onChange={(e) => setNewVenue({...newVenue, image_url: e.target.value})} 
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan saja dulu jika ingin mencoba. Harus format URL asli (.jpg/.png).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={newVenue.category} 
                  onChange={(e) => setNewVenue({...newVenue, category: e.target.value})}
                >
                  <option value="Futsal">Futsal</option>
                  <option value="Basket">Basket</option>
                  <option value="Bulu Tangkis">Bulu Tangkis</option>
                  <option value="Tenis">Tenis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga / Jam (Tanpa titik)</label>
                <input 
                  type="number" required 
                  placeholder="Misal: 100000"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={newVenue.price_per_hour} 
                  onChange={(e) => setNewVenue({...newVenue, price_per_hour: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  required rows={2}
                  placeholder="Masukkan alamat lengkap..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={newVenue.address} 
                  onChange={(e) => setNewVenue({...newVenue, address: e.target.value})} 
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddingVenue(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Tambah Lapangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟡 MODAL EDIT LAPANGAN */}
      {editingVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-amber-500 p-4 text-white font-bold text-lg sticky top-0">Edit Lapangan</div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama GOR/Lapangan</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={editingVenue.name} 
                  onChange={(e) => setEditingVenue({...editingVenue, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar Lapangan</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none text-black text-sm"
                  placeholder="https://contoh.com/gambar.jpg"
                  value={editingVenue.image_url || ''} 
                  onChange={(e) => setEditingVenue({...editingVenue, image_url: e.target.value})} 
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ada gambar.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={editingVenue.category} 
                  onChange={(e) => setEditingVenue({...editingVenue, category: e.target.value})}
                >
                  <option value="Futsal">Futsal</option>
                  <option value="Basket">Basket</option>
                  <option value="Bulu Tangkis">Bulu Tangkis</option>
                  <option value="Tenis">Tenis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga / Jam (Tanpa titik)</label>
                <input 
                  type="number" required 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={editingVenue.price_per_hour} 
                  onChange={(e) => setEditingVenue({...editingVenue, price_per_hour: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  required rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={editingVenue.address} 
                  onChange={(e) => setEditingVenue({...editingVenue, address: e.target.value})} 
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingVenue(null)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD UTAMA */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard SportAja</h1>
            <p className="text-gray-500 mt-1">Manajemen Lapangan Olahraga</p>
          </div>
          <div className="flex gap-3">
            <Link href="/pengguna" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              👥 Kelola Pengguna
            </Link>

            <Link href="/pesanan" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              🧾 Lihat Pesanan
            </Link>
            
            <button 
              onClick={() => setIsAddingVenue(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              + Tambah Lapangan
            </button>
          </div>
        </div>

        {/* TABEL DATA LAPANGAN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Gambar</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Nama GOR</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Kategori</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Harga / Jam</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-8 text-center text-red-500 bg-red-50">{error}</td></tr>
              ) : venues.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Belum ada data lapangan.</td></tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        {venue.image_url ? (
                          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base">{venue.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs md:max-w-md">{venue.address}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-100">
                        {venue.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-700">
                      {formatRupiah(venue.price_per_hour)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setEditingVenue(venue)}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(venue.id, venue.name)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Hapus
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

declare global {
  interface String {
    substringBefore(delimiter: string): string;
  }
}