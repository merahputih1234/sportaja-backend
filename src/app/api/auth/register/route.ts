import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    // 1. Cek apakah email sudah dipakai
    const [existingUsers]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar!' }, { status: 400 });
    }

    // 2. Enkripsi password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke database
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );

    return NextResponse.json({ message: 'Registrasi berhasil!', userId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("Error Register:", error);
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}