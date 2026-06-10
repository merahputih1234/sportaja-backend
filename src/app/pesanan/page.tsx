"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PesananMasuk() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) setBookings(await res.json());
    } catch (error) { console.error("Gagal fetch:", error); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Batalkan pesanan ini dan kembalikan dana ke SportAja Pay pelanggan?")) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });
      if (res.ok) {
        alert("Pesanan berhasil dibatalkan dan direfund!");
        fetchBookings(); // Refresh data
      } else {
        alert("Gagal membatalkan pesanan.");
      }
    } catch (error) { alert("Gagal membatalkan pesanan"); }
  };

  // FUNGSI PINTAR: Cek apakah jadwal sudah kadaluarsa (Time Out)
  const isBookingTimeOut = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;
    try {
      // Mengubah string tanggal menjadi objek Date bawaan JS agar dikonversi otomatis ke Waktu Lokal
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const cleanDate = `${year}-${month}-${day}`; 
      
      const times = timeStr.split(',').map(t => t.trim());
      const lastTime = times[times.length - 1];
      
      const bookingDateTime = new Date(`${cleanDate}T${lastTime}:00`);
      bookingDateTime.setHours(bookingDateTime.getHours() + 1); 
      
      return new Date() >= bookingDateTime;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pesanan Masuk</h1>
            <p className="text-gray-500 mt-1">Daftar tiket yang telah dipesan oleh pelanggan</p>
          </div>
          <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Kembali ke Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Kode Booking</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Pemesan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Jadwal Main</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total & Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada pesanan masuk.</td>
                </tr>
              ) : (
                bookings.map((b: any) => {
                  let waNumber = (b.user_phone || "").startsWith("0") ? "62" + b.user_phone.substring(1) : b.user_phone;
                  let waText = encodeURIComponent(`Halo ${b.user_name}, saya dari Admin SportAja terkait pesanan lapangan Anda dengan kode ${b.booking_code}...`);

                  const isExpired = isBookingTimeOut(b.booking_date, b.booking_time);
                  const isCancelled = b.status === 'Dibatalkan';
                  
                  let displayStatus = b.status || 'Pending';
                  if (isExpired && !isCancelled) displayStatus = 'Selesai (Time Out)';

                  const statusColorClass = isCancelled ? 'text-red-500' : 
                                           isExpired ? 'text-gray-500' : 
                                           b.status === 'Lunas' ? 'text-green-500' : 'text-yellow-600';

                  return (
                    <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-70' : ''}`}>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                          {b.booking_code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{b.user_name}</div>
                        <div className="text-xs text-gray-500">{b.venue_name}</div>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="text-sm">{new Date(b.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        <div className="text-sm font-bold text-blue-600 mt-1">{b.booking_time}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        Rp {Number(b.total_payment).toLocaleString('id-ID')} <br/>
                        <span className={`text-xs font-bold ${statusColorClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <a 
                          href={`https://wa.me/${waNumber}?text=${waText}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Chat WA
                        </a>
                        {!isCancelled && !isExpired && (
                          <button 
                            onClick={() => handleCancel(b.id)} 
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}