import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER     ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME     ?? 'iot_spms',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  await conn.query('SELECT 1');
  conn.release();
  console.log('✅  Database connected successfully');
}

export default pool;
