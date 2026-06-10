"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Definisikan struktur data lapangan agar tidak error saat build
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

  // Fungsi untuk mengambil data dari API Next.js secara dinamis
  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      // Menggunakan relative path '/api/venues' agar otomatis menyesuaikan domain Vercel
      const res = await fetch('/api/venues', {
        cache: 'no-store' // Memastikan data selalu segar/baru dari database
      });
      
      if (!res.ok) {
        throw new Error(`Gagal memuat data (Status: ${res.status})`);
      }
      
      const data = await res.json();
      setVenues(data);
    } catch (err: any) {
      console.error("Error fetching venues:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // Fungsi pembantu untuk memformat nominal angka ke Rupiah
  const formatRupiah = (priceStr: string) => {
    const numericPrice = parseInt(priceStr.substringBefore("."));
    const cleanPrice = isNaN(numericPrice) ? parseFloat(priceStr) || 0 : numericPrice;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(cleanPrice);
  };

  // Ekstensi helper sederhana untuk menyamakan split logika
  String.prototype.substringBefore = function(delimiter: string) {
    const index = this.indexOf(delimiter);
    return index === -1 ? this.toString() : this.substring(0, index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR / HEADER DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard SportAja</h1>
            <p className="text-gray-500 mt-1">Manajemen Lapangan Olahraga</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              👥 Kelola Pengguna
            </button>
            <Link href="/pesanan" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              🧾 Lihat Pesanan
            </Link>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              + Tambah Lapangan
            </button>
          </div>
        </div>

        {/* UTAMA: TABEL DATA LAPANGAN */}
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
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <div>Menghubungkan ke database cloud...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-500 bg-red-50">
                    ⚠️ Error: {error}. Periksa kembali Environment Variables di Vercel atau SSL Aiven Anda.
                  </td>
                </tr>
              ) : venues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Belum ada data lapangan di database online Aiven. Silakan tambahkan lewat form atau Workbench.
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* KOLOM GAMBAR */}
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        {venue.image_url ? (
                          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                      </div>
                    </td>
                    
                    {/* KOLOM NAMA & ALAMAT */}
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base">{venue.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs md:max-w-md">{venue.address}</div>
                    </td>
                    
                    {/* KOLOM KATEGORI */}
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-100">
                        {venue.category}
                      </span>
                    </td>
                    
                    {/* KOLOM HARGA */}
                    <td className="p-4 font-bold text-gray-700">
                      {formatRupiah(venue.price_per_hour)}
                    </td>
                    
                    {/* KOLOM AKSI EDIT/HAPUS */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => alert(`Fitur Edit untuk ${venue.name} sedang dikembangkan.`)}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => alert(`Fitur Hapus untuk ${venue.name} sedang dikembangkan.`)}
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

// Deklarasi global scope interface agar tidak error tipe data string
declare global {
  interface String {
    substringBefore(delimiter: string): string;
  }
}