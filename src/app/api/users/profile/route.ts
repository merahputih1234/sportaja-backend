import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { id, name, phone, profile_picture } = await request.json();

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, profile_picture = ? WHERE id = ?',
      [name, phone, profile_picture, id]
    );

    return NextResponse.json({ message: 'Profil berhasil diperbarui!' }, { status: 200 });
  } catch (error) {
    console.error("Error Update Profile:", error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}