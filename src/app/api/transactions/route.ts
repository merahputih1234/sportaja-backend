import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const [rows]: any = await pool.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error Fetching Transactions:", error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat transaksi' }, { status: 500 });
  }
}