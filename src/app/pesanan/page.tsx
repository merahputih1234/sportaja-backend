"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PesananPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Gagal mengambil pesanan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🌟 FUNGSI SET LUNAS (Dengan Error Catcher)
  const handleMarkAsPaid = async (bookingId: number, bookingCode: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menandai pesanan ${bookingCode} sebagai LUNAS?`)) return;

    try {
      setIsProcessing(true);
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'mark_paid' })
      });

      // Menangkap pesan aslinya dari database/API
      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("Sukses! Pesanan telah ditandai Lunas.");
        fetchBookings(); 
      } else {
        // Ini akan memunculkan error aslinya ke layarmu!
        alert(`Gagal: ${data?.error || res.statusText || 'Terjadi kesalahan sistem'}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan jaringan: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🌟 FUNGSI BATALKAN (Dengan Error Catcher)
  const handleCancelBooking = async (bookingId: number, bookingCode: string) => {
    if (!window.confirm(`Yakin ingin MEMBATALKAN pesanan ${bookingCode}?\nJika sudah Lunas, saldo akan otomatis dikembalikan ke Dompet pengguna.`)) return;

    try {
      setIsProcessing(true);
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'cancel' })
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("Pesanan berhasil dibatalkan!");
        fetchBookings(); 
      } else {
        alert(`Gagal membatalkan: ${data?.error || res.statusText || 'Terjadi kesalahan sistem'}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan jaringan: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Daftar Pesanan</h1>
            <p className="text-gray-500 mt-1">Pantau transaksi dan kelola status pembayaran lapangan</p>
          </div>
          <Link href="/" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            ⬅ Kembali ke Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Kode Booking</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Pemesan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Jadwal Main</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Metode Bayar</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total & Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                    <div>Memuat riwayat pesanan...</div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Belum ada pesanan yang masuk.
                  </td>
                </tr>
              ) : (
                bookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-sm">
                        {b.booking_code}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base">{b.user_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.venue_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">{b.booking_date}</div>
                      <div className="font-bold text-blue-600 mt-0.5">{b.booking_time} WIB</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">{b.payment_method}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base mb-1">{formatRupiah(b.total_payment)}</div>
                      <span className={`text-sm font-bold block mb-2 ${
                        b.status === 'Lunas' ? 'text-emerald-500' : 
                        b.status === 'Dibatalkan' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {(b.status === 'Pending' || !b.status) && (
                          <button
                            onClick={() => handleMarkAsPaid(b.id, b.booking_code)}
                            disabled={isProcessing}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded transition-colors text-xs font-bold shadow-sm"
                          >
                            ✅ Set Lunas
                          </button>
                        )}
                        {b.status !== 'Dibatalkan' && (
                          <button
                            onClick={() => handleCancelBooking(b.id, b.booking_code)}
                            disabled={isProcessing}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors text-xs font-bold shadow-sm"
                          >
                            ❌ Batalkan
                          </button>
                        )}
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