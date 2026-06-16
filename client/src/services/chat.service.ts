import type { ChatApiResponse, HistoryApiResponse, ApiError } from '../types';

// Same-origin in production; Vite proxy handles /chat → localhost:3000 in dev
const API_BASE = 'http://localhost:3000';

const TIMEOUT_MS = 30_000;

/** Creates a fetch with a 30-second AbortSignal timeout. */
const fetchWithTimeout = (url: string, options: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
};

/** Extracts a user-friendly error message from a non-OK response. */
const extractErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = (await res.json()) as ApiError;
    return body?.error?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

/**
 * Sends a message to the backend and returns the AI reply + sessionId.
 * @throws Error with a user-facing message on failure.
 */
export const sendMessage = async (
  message:   string,
  sessionId?: string,
): Promise<ChatApiResponse> => {
  let res: Response;

  try {
    res = await fetchWithTimeout(`${API_BASE}/chat/message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, sessionId }),
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }
    throw new Error('Unable to reach the server. Check your connection.');
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }

  return res.json() as Promise<ChatApiResponse>;
};

/**
 * Fetches the message history for an existing session.
 * Returns null when the session doesn't exist (404) so callers
 * can silently start a fresh conversation instead of erroring.
 */
export const getHistory = async (sessionId: string): Promise<HistoryApiResponse | null> => {
  let res: Response;

  try {
    res = await fetchWithTimeout(`${API_BASE}/chat/history/${sessionId}`, {
      method: 'GET',
    });
  } catch {
    // Network error — skip history, start fresh
    return null;
  }

  if (res.status === 404) return null;
  if (!res.ok) return null;

  return res.json() as Promise<HistoryApiResponse>;
};
