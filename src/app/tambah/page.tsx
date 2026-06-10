'use client'; // Menandakan ini adalah Client Component karena memiliki interaksi Form

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TambahLapangan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({
    name: '',
    category: 'Futsal',
    address: '',
    price_per_hour: '',
    facilities: '',
    image_url: '' // <--- PASTIKAN BARIS INI ADA
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Lapangan berhasil ditambahkan!');
        router.push('/'); // Kembali ke halaman utama
        router.refresh(); // Me-refresh data di halaman utama
      } else {
        alert('Gagal menambahkan lapangan.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Tambah Lapangan Baru</h1>
          <Link href="/" className="text-gray-500 hover:text-gray-800 font-medium">
            Batal & Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama GOR / Lapangan</label>
            <input 
              type="text" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: GOR Futsal Arena"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Olahraga</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Futsal">Futsal</option>
                <option value="Basket">Basket</option>
                <option value="Bulu Tangkis">Bulu Tangkis</option>
                <option value="Tenis">Tenis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Jam (Rp)</label>
              <input 
                type="number" required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: 100000"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({...formData, price_per_hour: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
            <textarea 
              required rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Jl. Sudirman No. 123, Purwokerto"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas (Pisahkan dengan koma)</label>
            <input 
              type="text" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Parkir Luas, Kantin, Toilet Bersih"
              value={formData.facilities}
              onChange={(e) => setFormData({...formData, facilities: e.target.value})}
            />
          </div>

          {/* Tambahkan blok input URL Gambar ini */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL / Link Gambar Lapangan</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: https://link-gambar.com/futsal.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-blue-300"
          >
            {isLoading ? 'Menyimpan Data...' : 'Simpan Lapangan'}
          </button>
        </form>
      </div>
    </div>
  );
}