import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const [rows]: any = await pool.query('SELECT balance FROM users WHERE id = ?', [userId]);
    return NextResponse.json({ balance: rows[0]?.balance || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching balance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const { userId, amount, method } = await request.json();
    
    // 1. Tambah Saldo
    await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);
    
    // 2. Catat ke Tabel Transaksi
    const title = `Top Up Saldo - ${method || 'Sistem'}`;
    await connection.query('INSERT INTO transactions (user_id, title, amount, type) VALUES (?, ?, ?, ?)', [userId, title, amount, 'IN']);
    
    const [rows]: any = await connection.query('SELECT balance FROM users WHERE id = ?', [userId]);
    
    await connection.commit();
    connection.release();
    
    return NextResponse.json({ message: 'Top Up Berhasil!', newBalance: rows[0].balance }, { status: 200 });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return NextResponse.json({ error: 'Gagal Top Up' }, { status: 500 });
  }
}