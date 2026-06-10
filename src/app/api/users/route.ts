import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Kita mengambil semua data kecuali password demi keamanan
    const query = `SELECT id, name, email, phone, created_at FROM users ORDER BY id DESC`;
    const [rows] = await pool.query(query);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error Fetching Users:", error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna' }, { status: 500 });
  }
}