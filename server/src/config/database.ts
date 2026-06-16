import { Pool, PoolConfig } from 'pg';
import { config } from './env';

const poolConfig: PoolConfig = {
  host:     config.database.host,
  port:     config.database.port,
  database: config.database.name,
  user:     config.database.user,
  password: config.database.password,
  ...(config.database.ssl && { ssl: { rejectUnauthorized: false } }),
  // Keep a healthy pool without exhausting DB connections
  max:                    20,
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 3_000,
};

export const pool = new Pool(poolConfig);

// Surface idle-client errors so they don't get swallowed silently
pool.on('error', (err) => {
  console.error('[DB] Idle client error:', err.message);
});

/** Verifies DB is reachable. Called once on server start. */
export const verifyDatabaseConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};
