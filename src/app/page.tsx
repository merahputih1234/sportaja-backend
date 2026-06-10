import Link from 'next/link';
export const dynamic = 'force-dynamic'; // Memastikan data selalu fresh (tidak di-cache)

async function getVenues() {
  try {
    const res = await fetch('http://localhost:3000/api/venues', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Gagal fetch data:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  const venues = await getVenues();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard SportAja</h1>
            <p className="text-gray-500 mt-1">Manajemen Lapangan Olahraga</p>
          </div>
            <div className="flex gap-4">
            <Link href="/pengguna" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center">
              👥 Kelola Pengguna
            </Link>
            <Link href="/pesanan" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center">
              📋 Lihat Pesanan
            </Link>
            <Link href="/tambah" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center">
              + Tambah Lapangan
            </Link>
          </div>
        </div>

        {/* Tabel Data Lapangan */}
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
              
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada data lapangan. Silakan tambahkan dari database atau form.
                  </td>
                </tr>
              ) : (
                venues.map((venue: any) => (
                  <tr key={venue.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {venue.image_url ? (
                          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{venue.name}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {venue.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      Rp {Number(venue.price_per_hour).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      {/* PERUBAHAN ADA DI SINI: Tombol Edit sekarang menjadi Link dinamis */}
                      <Link href={`/edit/${venue.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                        Edit
                      </Link>
                      
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
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