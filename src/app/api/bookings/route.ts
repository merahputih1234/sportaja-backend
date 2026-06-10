import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  await connection.beginTransaction(); 

  try {
    const { user_id, venue_id, booking_date, booking_time, total_payment, payment_method } = await request.json();

    if (payment_method === 'SportAja Pay') {
      const [userRows]: any = await connection.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [user_id]);
      const currentBalance = userRows[0]?.balance || 0;

      if (currentBalance < total_payment) {
        await connection.rollback(); 
        connection.release();
        return NextResponse.json({ error: 'Saldo SportAja Pay tidak cukup!' }, { status: 400 });
      }
      await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [total_payment, user_id]);
    }

    const booking_code = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    const status_awal = payment_method === 'SportAja Pay' ? 'Lunas' : 'Pending';

    await connection.query(
      'INSERT INTO bookings (user_id, venue_id, booking_date, booking_time, total_payment, payment_method, booking_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, venue_id, booking_date, booking_time, total_payment, payment_method, booking_code, status_awal]
    );

    await connection.query(
      'INSERT INTO transactions (user_id, title, amount, type) VALUES (?, ?, ?, ?)', 
      [user_id, `Pembayaran Lapangan (${payment_method})`, total_payment, 'OUT']
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: 'Booking berhasil!', booking_code }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let query = `
      SELECT b.id, b.booking_code, v.name as venue_name, DATE_FORMAT(b.booking_date, '%d %b %Y') as booking_date, 
             b.booking_time, b.total_payment, b.payment_method, b.status, u.phone as user_phone, u.name as user_name 
      FROM bookings b JOIN venues v ON b.venue_id = v.id JOIN users u ON b.user_id = u.id
    `;
    let params: any[] = [];
    if (userId) { query += ` WHERE b.user_id = ?`; params.push(userId); }
    query += ` ORDER BY b.id DESC`;
    const [rows]: any = await pool.query(query, params);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) { return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, action } = body; 
    
    const [bookingRows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    const booking = bookingRows[0];
    
    if (!booking) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });

    // 🌟 FITUR SET LUNAS
    if (action === 'mark_paid') {
      if (booking.status === 'Lunas') return NextResponse.json({ error: 'Sudah lunas' }, { status: 400 });
      
      // 🔥 PERBAIKAN: Menggunakan Parameter (Tanda Tanya ?) agar aman dari aturan ANSI_QUOTES Aiven
      await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['Lunas', booking_id]);
      
      return NextResponse.json({ message: 'Pesanan berhasil ditandai Lunas!' }, { status: 200 });
    }

    // 🌟 FITUR BATALKAN
    if (!action || action === 'cancel') {
      if (booking.status === 'Dibatalkan') return NextResponse.json({ error: 'Sudah dibatalkan sebelumnya' }, { status: 400 });

      if (booking.status === 'Lunas') {
        await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', [booking.total_payment, booking.user_id]);
        await pool.query(
          'INSERT INTO transactions (user_id, title, amount, type) VALUES (?, ?, ?, ?)', 
          [booking.user_id, `Refund - Batal Pesan (${booking.booking_code})`, booking.total_payment, 'IN']
        );
      }

      // 🔥 PERBAIKAN: Menggunakan Parameter (Tanda Tanya ?)
      await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['Dibatalkan', booking_id]);
      
      return NextResponse.json({ message: 'Pesanan dibatalkan & dana ditangani.' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Perintah tidak valid' }, { status: 400 });
  } catch (error: any) {
    console.error("PUT Error:", error);
    // 🌟 BUKA TOPENG ERROR: Menampilkan pesan asli dari database jika gagal
    return NextResponse.json({ error: `Backend Error: ${error.message}` }, { status: 500 });
  }
}