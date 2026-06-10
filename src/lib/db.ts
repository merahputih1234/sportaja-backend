import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'mysql-sportaja-bangimhmek-c30a.e.aivencloud.com', // Contoh: mysql-sportaja-xxx.aivencloud.com
  port: 16976,                             // Isi dengan Port Aiven yang baru
  user: 'avnadmin',
  password: 'AVNS_uw-p_p6rTtDwJEB1Bnz',
  database: 'defaultdb',                   // Biasanya nama database bawaan Aiven adalah defaultdb
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // ⚠️ WAJIB ADA UNTUK CLOUD DATABASE!
  ssl: {
    rejectUnauthorized: false 
  }
});

export default pool;