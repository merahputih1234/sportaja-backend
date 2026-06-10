import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mengambil 1 data spesifik berdasarkan ID untuk ditampilkan di Form
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Di Next.js terbaru, params harus di-await terlebih dahulu
    const params = await context.params;
    
    const [rows] = await pool.query('SELECT * FROM venues WHERE id = ?', [params.id]);
    const venues = rows as any[];
    
    if (venues.length === 0) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    return NextResponse.json(venues[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// Menyimpan perubahan data (UPDATE) ke MySQL
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Di Next.js terbaru, params harus di-await terlebih dahulu
    const params = await context.params;
    
    const body = await request.json();
    const { name, category, address, price_per_hour, facilities, image_url } = body;
    
    const query = `
      UPDATE venues 
      SET name = ?, category = ?, address = ?, price_per_hour = ?, facilities = ?, image_url = ?
      WHERE id = ?
    `;
    await pool.query(query, [name, category, address, price_per_hour, facilities, image_url || '', params.id]);
    
    return NextResponse.json({ message: 'Berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}