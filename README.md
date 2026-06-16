# 🛍️ ShopEase AI Chat Agent

A customer-support chat widget for a fictional e-commerce store, powered by **Google Gemini**, built on a **Node.js / TypeScript / Express** backend and a **Svelte 4 / Vite** frontend, with conversations persisted to **PostgreSQL**.

---

## Table of Contents

1. [Running Locally](#1-running-locally)
   - [Prerequisites](#prerequisites)
   - [Step 1 — Get the code](#step-1--get-the-code)
   - [Step 2 — Start the database](#step-2--start-the-database)
   - [Step 3 — Configure environment variables](#step-3--configure-environment-variables)
   - [Step 4 — Run migrations](#step-4--run-migrations)
   - [Step 5 — Start both servers](#step-5--start-both-servers)
   - [Step 6 — Verify it works](#step-6--verify-it-works)
   - [Production build](#production-build)
2. [Architecture](#2-architecture)
   - [Directory layout](#directory-layout)
   - [Backend layers](#backend-layers)
   - [Request lifecycle](#request-lifecycle)
   - [Frontend structure](#frontend-structure)
   - [Design decisions](#design-decisions)
3. [LLM Notes](#3-llm-notes)
   - [Provider & model](#provider--model)
   - [Prompting strategy](#prompting-strategy)
   - [Context window management](#context-window-management)
   - [Error mapping](#error-mapping)
4. [API Reference](#4-api-reference)
5. [Trade-offs & If I Had More Time](#5-trade-offs--if-i-had-more-time)

---

## 1. Running Locally

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | `node -v` to check |
| npm | ≥ 9 | bundled with Node |
| PostgreSQL | ≥ 14 | local install or any hosted instance |
| A Gemini API key | — | free at [aistudio.google.com](https://aistudio.google.com/app/apikey) |

> **No Gemini account yet?** Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), sign in with a Google account, and click **Create API key**. The free tier is sufficient for local development.

---

### Step 1 — Get the code

```bash
git clone <repo-url>
cd ai-chat-agent
```

Install dependencies for both workspaces:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 2 — Start the database

Create a PostgreSQL database for the app. The defaults in `.env.example` assume:

| Setting | Value |
|---------|-------|
| Database | `chat_agent` |
| User | `postgres` |
| Password | `postgres` |
| Port | `5432` |
| Host | `localhost` |

Example with a local Postgres install:

```bash
createdb chat_agent
```

If you use a hosted provider (Render, Supabase, etc.), create the database there and set the matching `DB_*` values in `.env`.

---

### Step 3 — Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in at minimum your **Gemini API key**:

```dotenv
# ── The only required change ─────────────────────────────
GEMINI_API_KEY=AIzaSy...your_key_here...

# ── Everything below has sensible defaults ───────────────
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=chat_agent
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

GEMINI_MODEL=gemini-1.5-flash   # or gemini-1.5-pro for higher quality
MAX_TOKENS=1024

MAX_MESSAGE_LENGTH=2000          # chars, user messages are truncated to this
MAX_HISTORY_MESSAGES=20          # last N turns sent to the model as context

CORS_ORIGIN=http://localhost:5173
```

#### Full variable reference

| Variable | Default | Required | Description |
|----------|---------|:--------:|-------------|
| `GEMINI_API_KEY` | — | ✅ | Your Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | | Model name — `gemini-1.5-flash` (fast/cheap) or `gemini-1.5-pro` (smarter) |
| `MAX_TOKENS` | `1024` | | Maximum tokens in the model reply |
| `PORT` | `3000` | | Express server port |
| `NODE_ENV` | `development` | | Set to `production` to disable stack traces in error responses |
| `DB_HOST` | `localhost` | | Postgres host |
| `DB_PORT` | `5432` | | Postgres port |
| `DB_NAME` | `chat_agent` | | Database name |
| `DB_USER` | `postgres` | | Database user |
| `DB_PASSWORD` | `postgres` | | Database password |
| `DB_SSL` | `false` | | Set `true` for cloud-hosted databases (Render, Supabase, etc.) |
| `MAX_MESSAGE_LENGTH` | `2000` | | Silently truncates user messages longer than this |
| `MAX_HISTORY_MESSAGES` | `20` | | How many prior turns to include in each LLM call |
| `CORS_ORIGIN` | `http://localhost:5173` | | Allowed origin for browser requests |

---

### Step 4 — Run migrations

Run:

```bash
cd backend
npm run migrate
```

This executes `migrations/001_init.sql`, which creates:

```sql
-- Conversations table (one row per chat session)
conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  metadata    JSONB            -- reserved for future use
)

-- Messages table (all turns for all sessions)
messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender          VARCHAR(5) CHECK (sender IN ('user', 'ai')),
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ
)

-- Indexes on conversation_id and created_at for fast history queries
```

There is no seed data — conversations are created on-demand by the first message.

---

### Step 5 — Start both servers

Open **two terminals** from the project root:

```bash
# Terminal 1 — Express API with ts-node-dev hot reload
cd backend
npm run dev
# → Listening on http://localhost:3000
```

```bash
# Terminal 2 — Vite dev server with HMR
cd frontend
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/chat` and `/health` to `localhost:3000`, so no CORS configuration is needed during development.

---

### Step 6 — Verify it works

```bash
# Health check
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}

# Send a test message
curl -X POST http://localhost:3000/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your return policy?"}'
# → {"reply":"...","sessionId":"<uuid>"}
```

Then open **http://localhost:5173** and click the purple chat button in the bottom-right corner.

---

### Production build

```bash
# Backend — compiles TypeScript to dist/
cd backend
npm run build
npm start

# Frontend — outputs static files to frontend/dist/
cd frontend
npm run build
# Serve dist/ with Nginx, Caddy, or any static host.
# Set CORS_ORIGIN in backend .env to your frontend's domain.
```

---

## 2. Architecture

### Directory layout

```
ai-chat-agent/
├── README.md
├── backend/
│   ├── .env.example
│   ├── migrations/
│   │   ├── 001_init.sql        ← schema (tables + indexes)
│   │   └── run.ts              ← standalone migration runner
│   └── src/
│       ├── config/
│       │   ├── env.ts          ← fail-fast env validation
│       │   └── database.ts     ← pg Pool + connectivity check
│       ├── constants/
│       │   └── storeKnowledge.ts ← Gemini system prompt / store policies
│       ├── types/index.ts      ← all domain interfaces
│       ├── utils/errors.ts     ← createError() factory
│       ├── repositories/
│       │   ├── conversation.repository.ts
│       │   └── message.repository.ts
│       ├── services/
│       │   ├── chat.service.ts ← orchestration, rollback logic
│       │   └── llm.service.ts  ← Gemini API wrapper
│       ├── controllers/
│       │   └── chat.controller.ts
│       ├── middleware/
│       │   ├── error.middleware.ts      ← centralised error handler
│       │   └── validation.middleware.ts ← express-validator chains
│       ├── routes/
│       │   └── chat.routes.ts  ← DI wiring + route map
│       ├── app.ts              ← Express app factory
│       └── server.ts           ← process entry point
└── frontend/
    └── src/
        ├── types/index.ts
        ├── services/
        │   └── chat.service.ts  ← fetch wrapper with AbortSignal timeout
        ├── components/
        │   ├── ChatWidget.svelte     ← panel, FAB, session, quick chips
        │   ├── MessageBubble.svelte  ← user vs AI bubble styling
        │   ├── TypingIndicator.svelte
        │   └── ChatInput.svelte      ← auto-grow textarea + char counter
        └── App.svelte               ← ShopEase landing page
```

---

### Backend layers

The backend follows a strict four-layer architecture. Each layer only depends on the layer directly below it — no layer ever imports from a layer above it.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────┐
│  Middleware                             │  validation.middleware.ts
│  (input validation, error handling)    │  error.middleware.ts
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Controller                             │  chat.controller.ts
│  (HTTP in/out, delegates to service)   │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Service                                │  chat.service.ts
│  (business logic, orchestration)       │  llm.service.ts
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Repository                             │  conversation.repository.ts
│  (all SQL, no business logic)          │  message.repository.ts
└─────────────────────────────────────────┘
     │
     ▼
  PostgreSQL
```

The entire dependency graph is wired in `chat.routes.ts` — a single place that calls `new` on every class and threads them together. This means every layer is a plain class with no framework coupling, making each one independently testable by swapping in a mock.

---

### Request lifecycle

Here is exactly what happens when a user sends a message:

```
1. POST /chat/message  { message, sessionId? }

2. validateSendMessage middleware
   → 422 if message is empty, too long, or sessionId is malformed

3. ChatController.sendMessage
   → truncates message to MAX_MESSAGE_LENGTH
   → calls ChatService.processMessage

4. ChatService.processMessage
   a. Resolve conversation
      → find existing by sessionId, or create a new one (returns UUID)
   b. Load history
      → last MAX_HISTORY_MESSAGES messages from DB (snapshot BEFORE persisting)
   c. Persist user message to DB
   d. Build LLM message array (dedup, enforce alternating roles)
   e. Call LLMService.generateReply
      → on failure: delete the user message (rollback), rethrow
   f. Persist AI reply to DB
   g. Touch conversation.updated_at
   h. Return { reply, sessionId }

5. 200 { reply, sessionId }
```

---

### Frontend structure

The frontend is a single-page Svelte app. `App.svelte` renders the ShopEase landing page and always mounts `<ChatWidget>` at the bottom of the DOM, independent of routing.

`ChatWidget.svelte` owns all chat state:

- On `onMount`: reads `shopease_session` from `localStorage`, fetches history if found
- On send: adds an optimistic user bubble immediately, then calls the API
- On success: stores the returned `sessionId`, appends the AI reply bubble
- On error: appends a red error bubble in the AI slot (user message stays visible for retry)
- `afterUpdate`: scrolls the message list to the bottom

The three sub-components (`MessageBubble`, `TypingIndicator`, `ChatInput`) are purely presentational — they receive props and dispatch events but hold no state.

---

### Design decisions

**1. Persist then rollback, rather than persist after**

The user message is saved to the database *before* calling Gemini. If the Gemini call fails, the user message is deleted in a best-effort rollback. The alternative — persisting after a successful LLM call — would silently lose the audit trail on partial failures. Rollback preserves the audit trail as a primary goal while still keeping the DB in a valid state for the next call.

**2. History snapshot before persisting**

The history query runs before the new user message is written to the database. Without this, the user's own message would appear twice in the LLM context — once from the history fetch and once appended explicitly. The snapshot makes the data flow explicit and easy to reason about.

**3. Alternating-role deduplication in `buildLLMMessages`**

Both Anthropic and Gemini require conversation turns to strictly alternate user/model. Rather than enforcing this at write time (which would require a transaction or constraint), the service enforces it at read time by merging consecutive same-role messages (keeping the latest) and stripping any leading model turns. This tolerates edge cases like double-sent messages or DB inconsistencies without crashing the LLM call.

**4. Dependency injection wired at the route level**

All `new` calls happen in `chat.routes.ts`. No class ever imports another class directly — they only import interfaces. This makes the entire service layer unit-testable with zero framework setup: pass in a mock repo, call the method, assert the result.

**5. Operational vs unexpected errors**

`createError(message, statusCode)` attaches `isOperational: true` to the error. The global error handler checks this flag: operational errors return their message and status code to the client; all other errors log the full stack and return a generic 500. This prevents accidental leakage of stack traces or database error strings to the browser.

**6. `sessionId` in `localStorage`, not a cookie**

A cookie would require `SameSite`/`HttpOnly` configuration and CORS credential headers. `localStorage` keeps the setup entirely stateless on the server — no sessions, no auth, no cookie parsing. The server trusts the UUID it issued; the worst a malicious client can do is read another session's history (acceptable for a demo, not for production).

---

## 3. LLM Notes

### Provider & model

**Provider:** Google Gemini via the `@google/generative-ai` Node.js SDK  
**Default model:** `gemini-1.5-flash`  
**Configurable via:** `GEMINI_MODEL` env var

`gemini-1.5-flash` was chosen as the default because it has a low latency, is cost-effective, and handles FAQ-style customer support well. Swap to `gemini-1.5-pro` in `.env` for noticeably better reasoning on ambiguous questions, at higher cost and latency.

---

### Prompting strategy

The system prompt (in `src/constants/storeKnowledge.ts`) does three things:

**1. Persona definition**
```
You are Alex, a friendly and professional customer support agent for ShopEase —
an online store selling electronics, clothing, and home goods.
```
Giving the agent a name and a store context keeps replies on-topic and in the right tone.

**2. Format instruction**
```
Respond in plain text only (no markdown, no bullet symbols). Use clear paragraph breaks.
Be warm, concise, and helpful. Never fabricate policies or prices.
```
The chat widget renders plain text — markdown symbols (like `**bold**` or `- list`) would appear literally. The explicit instruction prevents the model from defaulting to its markdown-heavy style.

**3. Grounded knowledge base**
The prompt contains the complete store policy document in plain text, structured with visual separators:
```
═══════════════════════════════════════════════
SHIPPING
═══════════════════════════════════════════════
Free standard shipping on all US orders over $50.
...
```
Sections cover: company info, shipping rates, returns policy, payment methods, support hours, and order tracking.

The last section explicitly tells the model its fallback:
```
If the question is not covered above, say you don't have that information and
offer to connect them with the support team at support@shopease.com.
```
This prevents hallucination — rather than inventing a plausible-sounding answer, the model has a scripted graceful exit.

---

### Context window management

Every request sends the last `MAX_HISTORY_MESSAGES` (default: 20) turns to the model. The history is split into two parts to match Gemini's chat API:

- **`history`** — all turns except the final user message, passed to `model.startChat({ history })`
- **`current`** — the final user message, sent via `chat.sendMessage()`

This is different from how Anthropic's API works (which takes a flat array). Gemini's split design lets the SDK maintain internal session state and is required by the SDK — passing everything as a flat array is not supported.

The 20-turn limit caps both cost and latency. For most support conversations this is more than enough context; for very long conversations the model loses the very earliest turns but retains the recent, relevant ones.

---

### Error mapping

The SDK throws distinct error classes for different failure modes. Each is mapped to a user-facing message and an appropriate HTTP status:

| SDK class | Cause | HTTP status | User message |
|-----------|-------|-------------|--------------|
| `GoogleGenerativeAIResponseError` | Safety block / content policy | 400 | "I cannot respond to that request due to content policies." |
| `GoogleGenerativeAIAbortError` | Request timed out | 504 | "The request timed out. Please try again." |
| `GoogleGenerativeAIFetchError` (401/403) | Bad API key | 503 | "AI service authentication failed." |
| `GoogleGenerativeAIFetchError` (429) | Rate limited | 503 | "Our assistant is currently busy." |
| `GoogleGenerativeAIFetchError` (5xx) | Gemini server error | 503 | "The AI service is temporarily unavailable." |
| `GoogleGenerativeAIError` (other) | Bad input / unknown | 503 | "Unable to process your request." |
| Plain network error | DNS / TLS / no connectivity | 503 | "Unable to reach the AI service." |

All operational errors (with `isOperational: true`) are returned as-is to the client. Unknown errors are logged with a full stack trace and returned as a generic 500.

---

## 4. API Reference

### `POST /chat/message`

**Request body**

```json
{
  "message":   "What is your return policy?",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

`sessionId` is optional. Omit it on the first message — the backend creates a new conversation and returns its UUID. Send it on every subsequent message to continue the same conversation.

**Response `200`**

```json
{
  "reply":     "You can return any item within 30 days of delivery...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| `422` | Validation failed — message empty, too long, or sessionId is not a valid UUID |
| `400` | Gemini blocked the content due to safety policy |
| `503` | Gemini unavailable, rate-limited, or auth failed |
| `504` | Gemini request timed out |
| `500` | Unexpected server-side bug |

---

### `GET /chat/history/:sessionId`

Returns all messages for an existing conversation, oldest first.

**Response `200`**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id":             "abc123",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "sender":         "user",
      "text":           "What is your return policy?",
      "createdAt":      "2024-06-15T10:30:00.000Z"
    },
    {
      "id":             "def456",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "sender":         "ai",
      "text":           "You can return any item within 30 days...",
      "createdAt":      "2024-06-15T10:30:02.000Z"
    }
  ]
}
```

**`404`** — session UUID not found. The frontend treats this as a signal to clear `localStorage` and start a fresh conversation.

---

### `GET /health`

```json
{ "status": "ok", "timestamp": "2024-06-15T10:30:00.000Z" }
```

No database ping. Suitable for use as a load balancer / container orchestrator liveness probe.

---

## 5. Trade-offs & If I Had More Time

### Trade-offs made

**No streaming.** The frontend waits for the full reply before rendering it. This is simpler — no SSE, no chunked transfer, no partial rendering state — but makes long replies feel slower. The typing indicator mitigates the perceived wait.

**System prompt as a static file.** Store policies are hardcoded in `storeKnowledge.ts`. Changing a policy means editing a TypeScript file and redeploying. For a real store this is a problem: a product manager needs to update return policies without a code deployment. The right move is a `policies` database table with an admin UI, injected into the prompt at request time.

**`localStorage` for session persistence.** Simple and stateless on the server, but it means: (a) sessions don't survive clearing browser data, (b) different browser tabs get different sessions, (c) there's no concept of a user account. Fine for a demo, wrong for a real product.

**No rate limiting.** Any client can spam the API at full speed, directly driving up Gemini costs. Adding `express-rate-limit` per IP would take about 10 minutes but was skipped to keep the setup frictionless.

**History truncation loses early context.** The last 20 turns are sent to the model. For a 40-turn conversation, the user's name or original issue stated at the start is gone. A smarter approach would summarise old turns into a running "context memo" rather than dropping them entirely.

**Single-tenant database.** All conversations share one schema with no user-level isolation. The `sessionId` is the only access control — anyone who knows a UUID can read that conversation's history.

---

### If I had more time

**Streaming replies.** Replace the single `generateContent` call with Gemini's streaming API (`generateContentStream`) and push chunks to the browser over Server-Sent Events. The typing indicator disappears and the reply renders word by word, which feels dramatically faster.

**Retrieval-augmented generation (RAG).** Instead of embedding the entire policy document in every system prompt, store FAQ entries in a vector database (pgvector is a natural fit since we already use Postgres). On each request, embed the user's question and retrieve the top-3 most relevant chunks. This scales to thousands of FAQ entries without inflating the prompt size or cost.

**Proper authentication.** Replace `localStorage` + anonymous UUIDs with JWT-based auth (or OAuth via Google/GitHub). Sessions become user-scoped, enabling features like "view all your past conversations" or agent handoff with customer history attached.

**Message queue for LLM calls.** Under heavy load, synchronous LLM calls make the Express event loop wait on slow network I/O. Moving LLM calls to a BullMQ worker queue decouples the HTTP layer from the model latency, allows retries with backoff, and makes the system horizontally scalable.

**Redis session cache.** Every request currently hits Postgres twice (fetch history + persist message). Caching the last N messages per `sessionId` in Redis would cut DB load significantly for active conversations and reduce p95 latency.

**Admin dashboard.** A simple internal page showing conversation counts, average reply time, most common questions (via keyword clustering), and safety-block rate. This gives the team insight into what users are actually asking and whether the system prompt needs tuning.

**Eval pipeline.** A small test suite of question → expected-answer pairs (e.g. "What is the return window for electronics?" → should mention "15 days") run against the live prompt on every deploy, catching regressions when the system prompt is edited.
