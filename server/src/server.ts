import { config }                  from './config/env';
import { pool, verifyDatabaseConnection } from './config/database';
import { createApp }               from './app';

const start = async (): Promise<void> => {
  // Validate DB connectivity before accepting traffic
  await verifyDatabaseConnection();

  const app    = createApp(pool);
  const server = app.listen(config.port, () => {
    console.log(
      `[server] 🚀 Running on port ${config.port} in ${config.nodeEnv} mode`,
    );
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] ${signal} received — shutting down gracefully`);
    server.close(async () => {
      await pool.end();
      console.log('[server] DB pool closed. Bye!');
      process.exit(0);
    });
    // Force-kill after 10 s if requests are still pending
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // ── Safety nets ───────────────────────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled promise rejection:', reason);
    // Let the process supervisor restart; don't swallow silently
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught exception:', err);
    process.exit(1);
  });
};

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
