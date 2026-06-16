/**
 * Run with:  npm run migrate
 *
 * Reads DB credentials directly from env so it can run independently
 * of the compiled app (no dependency on src/config/env.ts).
 */
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config(); // load .env from cwd

const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME     ?? 'chat_agent',
  user:     process.env.DB_USER     ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
});

(async () => {
  const client = await pool.connect();
  try {
    const sql = readFileSync(join(__dirname, '001_init.sql'), 'utf-8');
    await client.query(sql);
    console.log('✅  Migration completed successfully');
  } catch (err) {
    console.error('❌  Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
