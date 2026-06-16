// ─── Domain models ────────────────────────────────────────────────────────────

export interface Conversation {
  id:        string;
  createdAt: Date;
  updatedAt: Date;
  metadata:  Record<string, unknown>;
}

export interface Message {
  id:             string;
  conversationId: string;
  sender:         'user' | 'ai';
  text:           string;
  createdAt:      Date;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ChatRequest {
  message:   string;
  sessionId?: string;
}

export interface ChatResponse {
  reply:     string;
  sessionId: string;
}

// ─── LLM ─────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role:    'user' | 'assistant';
  content: string;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface AppError extends Error {
  statusCode:    number;
  isOperational: boolean;
}
