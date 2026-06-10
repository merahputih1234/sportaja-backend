import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Kunci rahasia untuk membuat tiket JWT
const SECRET_KEY = 'sportaja_super_secret_key_123'; 

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Cari user berdasarkan email
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan!' }, { status: 401 });
    }

    // --- CEK STATUS BANNED ---
    if (user.is_banned === 1) {
      return NextResponse.json({ error: 'Akun Anda telah diblokir oleh Admin!' }, { status: 403 });
    }

    // 2. Cocokkan password yang diketik dengan yang ada di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Password salah!' }, { status: 401 });
    }

    // 3. Buat Kartu Akses Digital (Token JWT) yang berlaku selama 7 hari
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email }, 
      SECRET_KEY, 
      { expiresIn: '7d' }
    );

    // 4. Kirim token dan data user ke Android
    return NextResponse.json({
      message: 'Login berhasil!',
      token: token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        profile_picture: user.profile_picture // Foto profil dimasukkan ke sini
      }
    }, { status: 200 });

  // INI ADALAH BLOK PENUTUP YANG HILANG TADI:
  } catch (error) {
    console.error("Error Login:", error);
    return NextResponse.json({ error: 'Gagal memproses login' }, { status: 500 });
  }
}