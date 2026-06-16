-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────
-- conversations
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  metadata   JSONB       NOT NULL    DEFAULT '{}'
);

-- ─────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  -- 'user' | 'ai'  (5 chars max)
  sender          VARCHAR(5)  NOT NULL CHECK (sender IN ('user', 'ai')),
  text            TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_conv_time
  ON messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_conversations_updated
  ON conversations (updated_at DESC);
