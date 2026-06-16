<script lang="ts">
  import { onMount, afterUpdate, tick } from 'svelte';
  import { fly } from 'svelte/transition';

  import MessageBubble    from './MessageBubble.svelte';
  import TypingIndicator  from './TypingIndicator.svelte';
  import ChatInput        from './ChatInput.svelte';

  import { sendMessage, getHistory } from '../services/chat.service';
  import type { UIMessage, ChatStatus } from '../types';

  // ── State ──────────────────────────────────────────────────────────────────
  let isOpen     = false;
  let messages:  UIMessage[] = [];
  let status:    ChatStatus  = 'idle';
  let sessionId: string | undefined;
  let hasLoaded  = false;

  let messageListEl: HTMLDivElement;

  const SESSION_KEY  = 'shopease_session';
  const MAX_LENGTH   = 2000;

  // ── Quick-action chips shown on empty state ───────────────────────────────
  const QUICK_ACTIONS = [
    '📦 What\'s your return policy?',
    '🚚 Do you ship internationally?',
    '💳 What payment methods do you accept?',
    '📞 How do I contact support?',
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onMount(async () => {
    sessionId = localStorage.getItem(SESSION_KEY) ?? undefined;
    if (sessionId) {
      await loadHistory(sessionId);
    }
    hasLoaded = true;
  });

  // Auto-scroll whenever the messages array changes or typing indicator appears
  afterUpdate(() => {
    scrollToBottom();
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    if (messageListEl) {
      messageListEl.scrollTop = messageListEl.scrollHeight;
    }
  };

  const loadHistory = async (sid: string) => {
    const result = await getHistory(sid);
    if (!result) {
      // Session not found on server — clear stale local key
      localStorage.removeItem(SESSION_KEY);
      sessionId = undefined;
      return;
    }
    messages = result.messages.map((m) => ({
      id:        m.id,
      sender:    m.sender,
      text:      m.text,
      createdAt: new Date(m.createdAt),
    }));
  };

  const makeId = () => crypto.randomUUID();

  // ── Send flow ──────────────────────────────────────────────────────────────
  const handleSend = async (event: CustomEvent<string>) => {
    const text = event.detail.trim();
    if (!text || status === 'loading') return;

    // 1. Optimistic user bubble
    const optimisticId = makeId();
    messages = [
      ...messages,
      { id: optimisticId, sender: 'user', text, createdAt: new Date() },
    ];

    status = 'loading';
    await tick(); // let Svelte flush DOM so scroll happens after render

    try {
      const result = await sendMessage(text, sessionId);

      // Persist new / confirmed sessionId
      if (!sessionId || sessionId !== result.sessionId) {
        sessionId = result.sessionId;
        localStorage.setItem(SESSION_KEY, sessionId);
      }

      // Add AI reply
      messages = [
        ...messages,
        { id: makeId(), sender: 'ai', text: result.reply, createdAt: new Date() },
      ];
      status = 'idle';

    } catch (err) {
      // Replace optimistic bubble with error message in the AI slot
      const errorText = (err instanceof Error)
        ? err.message
        : 'Something went wrong. Please try again.';

      messages = [
        ...messages,
        { id: makeId(), sender: 'ai', text: errorText, createdAt: new Date(), isError: true },
      ];
      status = 'error';
      // Reset to idle so user can retry
      setTimeout(() => { status = 'idle'; }, 2000);
    }
  };

  const handleQuickAction = (text: string) => {
    handleSend(new CustomEvent('send', { detail: text }));
  };

  const toggleOpen = () => {
    isOpen = !isOpen;
    if (isOpen) {
      // Scroll to bottom whenever the panel is opened
      setTimeout(scrollToBottom, 50);
    }
  };
</script>

<!-- ── Floating toggle button ───────────────────────────────────────────────── -->
<button
  class="fab"
  on:click={toggleOpen}
  aria-label={isOpen ? 'Close chat' : 'Open chat'}
  aria-expanded={isOpen}
>
  {#if isOpen}
    <!-- X icon -->
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  {:else}
    <!-- Chat bubble icon -->
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <!-- Unread dot: only show before any conversation has started -->
    {#if messages.length === 0 && hasLoaded}
      <span class="unread-dot" aria-hidden="true"/>
    {/if}
  {/if}
</button>

<!-- ── Chat panel ────────────────────────────────────────────────────────────── -->
{#if isOpen}
  <div
    class="chat-panel"
    role="dialog"
    aria-label="Customer support chat"
    aria-modal="false"
    transition:fly={{ y: 24, duration: 220, opacity: 0 }}
  >
    <!-- Header -->
    <header class="chat-header">
      <div class="agent-info">
        <div class="agent-avatar" aria-hidden="true">SE</div>
        <div>
          <p class="agent-name">ShopEase Support</p>
          <p class="agent-status">
            <span class="status-dot" aria-hidden="true"/>
            Online — here to help
          </p>
        </div>
      </div>

      <button class="close-btn" on:click={toggleOpen} aria-label="Close chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </header>

    <!-- Message list -->
    <div class="message-list" bind:this={messageListEl} role="log" aria-live="polite">

      {#if !hasLoaded}
        <p class="hint">Loading history…</p>

      {:else if messages.length === 0}
        <!-- Empty state with quick actions -->
        <div class="empty-state">
          <div class="empty-icon" aria-hidden="true">👋</div>
          <p class="empty-title">Hi there!</p>
          <p class="empty-sub">I'm your ShopEase assistant. How can I help you today?</p>

          <div class="quick-actions" role="group" aria-label="Quick questions">
            {#each QUICK_ACTIONS as chip}
              <button
                class="chip"
                on:click={() => handleQuickAction(chip)}
                disabled={status === 'loading'}
              >{chip}</button>
            {/each}
          </div>
        </div>

      {:else}
        {#each messages as message (message.id)}
          <MessageBubble {message} />
        {/each}

        {#if status === 'loading'}
          <TypingIndicator />
        {/if}
      {/if}
    </div>

    <!-- Input -->
    <ChatInput
      disabled={status === 'loading'}
      maxLength={MAX_LENGTH}
      on:send={handleSend}
    />
  </div>
{/if}

<style>
  /* ── FAB ────────────────────────────────────────────────────────────────── */
  .fab {
    position:        fixed;
    bottom:          1.5rem;
    right:           1.5rem;
    width:           56px;
    height:          56px;
    border-radius:   50%;
    background:      linear-gradient(135deg,
      rgba(99 102 241 / 0.9),
      rgba(139 92 246 / 0.9));
    backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    border:          1px solid rgba(255 255 255 / 0.35);
    color:           white;
    display:         flex;
    align-items:     center;
    justify-content: center;
    box-shadow:
      0 8px 32px rgba(99 102 241 / 0.45),
      inset 0 1px 0 rgba(255 255 255 / 0.35),
      0 0 0 4px rgba(99 102 241 / 0.12);
    z-index:         var(--chat-z);
    transition:      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                     box-shadow 0.25s ease;
  }

  .fab:hover {
    transform: scale(1.1);
    box-shadow:
      0 12px 40px rgba(99 102 241 / 0.55),
      inset 0 1px 0 rgba(255 255 255 / 0.4),
      0 0 0 6px rgba(99 102 241 / 0.15);
  }
  .fab:active { transform: scale(0.96); }

  .unread-dot {
    position:      absolute;
    top:    6px;
    right:  6px;
    width:  12px;
    height: 12px;
    border-radius: 50%;
    background:    var(--clr-error);
    border:        2px solid white;
    animation:     pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1);    opacity: 1; }
    50%      { transform: scale(1.25); opacity: 0.7; }
  }

  /* ── Panel ──────────────────────────────────────────────────────────────── */
  .chat-panel {
    position:        fixed;
    bottom:          5rem;
    right:           1.5rem;
    width:           var(--chat-width);
    height:          var(--chat-height);
    background:      var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    border:          1px solid var(--glass-border);
    border-radius:   var(--radius-2xl);
    box-shadow:
      var(--glass-shadow-lg),
      inset 0 1px 0 var(--glass-highlight),
      0 0 80px rgba(99 102 241 / 0.08);
    z-index:         var(--chat-z);
    display:         flex;
    flex-direction:  column;
    overflow:        hidden;
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  .chat-header {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         1rem 1.25rem;
    background:      linear-gradient(135deg,
      rgba(99 102 241 / 0.85),
      rgba(139 92 246 / 0.85));
    backdrop-filter: blur(16px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(16px) saturate(var(--glass-saturate));
    border-bottom:   1px solid rgba(255 255 255 / 0.2);
    color:           white;
    flex-shrink:     0;
    box-shadow: inset 0 -1px 0 rgba(0 0 0 / 0.05);
  }

  .agent-info  { display: flex; align-items: center; gap: 0.75rem; }

  .agent-avatar {
    width:           40px;
    height:          40px;
    border-radius:   50%;
    background:      rgba(255 255 255 / 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border:          1px solid rgba(255 255 255 / 0.35);
    box-shadow: inset 0 1px 0 rgba(255 255 255 / 0.3);
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-weight:     700;
    font-size:       0.875rem;
    letter-spacing:  0.05em;
  }

  .agent-name   { font-weight: 600; font-size: var(--font-size-sm); margin: 0; }
  .agent-status { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; opacity: 0.9; margin: 0; }

  .status-dot {
    width:         8px;
    height:        8px;
    border-radius: 50%;
    background:    var(--clr-success);
    box-shadow:    0 0 8px rgba(34 197 94 / 0.6);
    animation:     statusPulse 2s ease-in-out infinite;
  }

  @keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }

  .close-btn {
    color:   white;
    opacity: 0.8;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    background: rgba(255 255 255 / 0.1);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255 255 255 / 0.15);
    transition: opacity 0.15s, background 0.15s;
  }
  .close-btn:hover {
    opacity: 1;
    background: rgba(255 255 255 / 0.2);
  }

  /* ── Message list ────────────────────────────────────────────────────────── */
  .message-list {
    flex:            1;
    overflow-y:      auto;
    padding:         1rem;
    display:         flex;
    flex-direction:  column;
    gap:             0.75rem;
    scroll-behavior: smooth;
  }

  .message-list::-webkit-scrollbar { width: 4px; }
  .message-list::-webkit-scrollbar-thumb {
    background:    var(--clr-border);
    border-radius: var(--radius-full);
  }

  .hint {
    text-align: center;
    color:      var(--clr-text-muted);
    font-size:  var(--font-size-sm);
    margin:     auto;
  }

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  .empty-state {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    text-align:     center;
    padding:        1.5rem 1rem;
    gap:            0.5rem;
    margin:         auto 0;
  }

  .empty-icon  { font-size: 2.5rem; }
  .empty-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--clr-text); }
  .empty-sub   { font-size: var(--font-size-sm); color: var(--clr-text-muted); max-width: 260px; }

  /* ── Quick action chips ──────────────────────────────────────────────────── */
  .quick-actions {
    display:         flex;
    flex-wrap:       wrap;
    justify-content: center;
    gap:             0.5rem;
    margin-top:      0.75rem;
  }

  .chip {
    padding:       0.4rem 0.875rem;
    font-size:     0.8rem;
    border:        1px solid rgba(99 102 241 / 0.35);
    border-radius: var(--radius-full);
    color:         var(--clr-primary);
    background:    var(--glass-bg);
    backdrop-filter: blur(8px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(8px) saturate(var(--glass-saturate));
    box-shadow: inset 0 1px 0 var(--glass-highlight);
    transition: background 0.2s, color 0.2s, transform 0.15s, box-shadow 0.2s;
    text-align:    left;
  }

  .chip:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--clr-primary), var(--clr-secondary));
    color:      white;
    border-color: transparent;
    transform:  translateY(-1px);
    box-shadow: 0 4px 12px rgba(99 102 241 / 0.3);
  }

  .chip:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .chat-panel {
      right:  0;
      bottom: 0;
      width:  100%;
      height: 100dvh;
      border-radius: 0;
      border: none;
    }
    .fab { bottom: 1rem; right: 1rem; }
  }
</style>
