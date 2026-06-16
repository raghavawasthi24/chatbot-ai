// ── Domain ────────────────────────────────────────────────────────────────────

export interface Message {
  id:             string;
  conversationId: string;
  sender:         'user' | 'ai';
  text:           string;
  createdAt:      string; // ISO date string from JSON
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface ChatApiResponse {
  reply:     string;
  sessionId: string;
}

export interface HistoryApiResponse {
  messages:  Message[];
  sessionId: string;
}

export interface ApiErrorDetail {
  field:   string;
  message: string;
}

export interface ApiError {
  error: {
    message: string;
    details?: ApiErrorDetail[];
  };
}

// ── UI state ──────────────────────────────────────────────────────────────────

/** Represents a message as it lives in the UI (may be optimistic / error state) */
export interface UIMessage {
  id:        string;
  sender:    'user' | 'ai';
  text:      string;
  createdAt: Date;
  isError?:  boolean; // true when the AI returned an error placeholder
}

export type ChatStatus = 'idle' | 'loading' | 'error';
