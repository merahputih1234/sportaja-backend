import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fungsi untuk MENGAMBIL data (GET)
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM venues ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error Fetching Venues:", error);
    return NextResponse.json({ error: 'Gagal mengambil data lapangan' }, { status: 500 });
  }
}

// Cari bagian fungsi POST, lalu ubah menjadi seperti ini:
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Tambahkan image_url di sini
    const { name, category, address, price_per_hour, facilities, image_url } = body;

    const query = `
      INSERT INTO venues (name, category, address, price_per_hour, facilities, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    // Tambahkan image_url ke dalam values
    const values = [name, category, address, price_per_hour, facilities, image_url || ''];

    const [result] = await pool.query(query, values);

    return NextResponse.json({ message: 'Berhasil menambahkan lapangan', id: (result as any).insertId }, { status: 201 });
  } catch (error) {
    console.error("Error Inserting Venue:", error);
    return NextResponse.json({ error: 'Gagal menambahkan data' }, { status: 500 });
  }
}