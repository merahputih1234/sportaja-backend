import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const date = searchParams.get('date');

    if (!venueId || !date) {
      return NextResponse.json({ error: 'venueId dan date wajib diisi' }, { status: 400 });
    }

    // 🔥 PERBAIKAN: Menggunakan Parameter (?) untuk 'Dibatalkan' 
    // agar Aiven tidak memblokirnya karena aturan ANSI_QUOTES
    const [rows]: any = await pool.query(
      'SELECT booking_time FROM bookings WHERE venue_id = ? AND booking_date = ? AND status != ?',
      [venueId, date, 'Dibatalkan']
    );

    let bookedSlots: string[] = [];
    
    rows.forEach((row: any) => {
      if (row.booking_time) {
        const times = row.booking_time.split(',').map((t: string) => t.trim());
        bookedSlots.push(...times);
      }
    });

    return NextResponse.json(bookedSlots, { status: 200 });
    
  } catch (error) {
    console.error("Error Fetching Slots:", error);
    return NextResponse.json({ error: 'Gagal mengambil slot waktu' }, { status: 500 });
  }
}