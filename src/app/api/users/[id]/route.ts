import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// PERHATIKAN: Tipe data params sekarang diubah menjadi Promise
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { action, newPassword, isBanned } = await request.json();
    
    // Kita harus meng-await params terlebih dahulu sebelum mengambil id-nya
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Skenario 1: Admin mereset password
    if (action === 'reset_password') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      return NextResponse.json({ message: 'Password berhasil diperbarui!' });
    }

    // Skenario 2: Admin memblokir / membuka blokir akun
    if (action === 'toggle_ban') {
      await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [isBanned, userId]);
      return NextResponse.json({ message: isBanned ? 'Akun diblokir!' : 'Blokir dibuka!' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    console.error("Error Updating User:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}