import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. FUNGSI GET (MENAMPILKAN DATA)
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM venues ORDER BY id DESC');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. FUNGSI DELETE (MENGHAPUS DATA)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    await pool.query('DELETE FROM venues WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Lapangan berhasil dihapus!' }, { status: 200 });
  } catch (error) {
    console.error("Gagal hapus:", error);
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}

// 3. FUNGSI PUT (MENGEDIT DATA)
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, category, address, price_per_hour, image_url } = data;

    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    await pool.query(
      'UPDATE venues SET name = ?, category = ?, address = ?, price_per_hour = ?, image_url = ? WHERE id = ?',
      [name, category, address, price_per_hour, image_url, id]
    );

    return NextResponse.json({ message: 'Lapangan berhasil diperbarui!' }, { status: 200 });
  } catch (error) {
    console.error("Gagal edit:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

// 🌟 4. FUNGSI POST BARU (MENAMBAH DATA)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, category, address, price_per_hour, image_url } = data;

    // Validasi sederhana
    if (!name || !category || !address || !price_per_hour) {
      return NextResponse.json({ error: 'Mohon lengkapi semua data wajib' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO venues (name, category, address, price_per_hour, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, category, address, price_per_hour, image_url || null]
    );

    return NextResponse.json({ message: 'Lapangan berhasil ditambahkan!' }, { status: 201 });
  } catch (error) {
    console.error("Gagal tambah:", error);
    return NextResponse.json({ error: 'Gagal menambahkan data lapangan' }, { status: 500 });
  }
}