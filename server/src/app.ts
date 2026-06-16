import express, { Application, Request, Response } from 'express';
import helmet  from 'helmet';
import cors    from 'cors';
import morgan  from 'morgan';
import { Pool } from 'pg';

import { config }          from './config/env';
import { createChatRouter } from './routes/chat.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

/**
 * Pure factory — no side-effects beyond wiring middleware.
 * Accepts the pool as a parameter so tests can inject a test DB.
 */
export const createApp = (pool: Pool): Application => {
  const app = express();

  // ── Security & logging ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(morgan(config.isDev ? 'dev' : 'combined'));

  // ── Body parsing (16 kb cap to match spec assumption) ─────────────────────
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: true, limit: '16kb' }));

  // ── Health check (no auth, no DB hit by default) ──────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Feature routes ────────────────────────────────────────────────────────
  app.use('/chat', createChatRouter(pool));

  // ── Error handling (must be LAST) ─────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
