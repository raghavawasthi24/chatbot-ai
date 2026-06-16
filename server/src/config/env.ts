import { config as loadDotenv } from 'dotenv';

loadDotenv(); // no-op if already loaded

/** Throw early if a required env var is missing (fail-fast). */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  port:    parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev:   (process.env.NODE_ENV ?? 'development') === 'development',

  database: {
    host:     process.env.DB_HOST     ?? 'localhost',
    port:     parseInt(process.env.DB_PORT ?? '5432', 10),
    name:     process.env.DB_NAME     ?? 'chat_agent',
    user:     process.env.DB_USER     ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    ssl:      process.env.DB_SSL === 'true',
  },

  gemini: {
    apiKey:    required('GEMINI_API_KEY'),
    model:     process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    maxTokens: parseInt(process.env.MAX_TOKENS ?? '1024', 10),
  },

  chat: {
    maxMessageLength:  parseInt(process.env.MAX_MESSAGE_LENGTH  ?? '2000', 10),
    maxHistoryMessages: parseInt(process.env.MAX_HISTORY_MESSAGES ?? '20',   10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
} as const;
