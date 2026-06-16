/**
 * Run with:  npm run migrate
 *
 * Reads DB credentials directly from env so it can run independently
 * of the compiled app (no dependency on src/config/env.ts).
 */
import { Pool, PoolConfig } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config(); // load .env from cwd

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ...(process.env.DB_SSL && {
        ssl: { rejectUnauthorized: false },
      }),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    };

export const pool = new Pool(poolConfig); 

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
