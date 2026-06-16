<script lang="ts">
  import type { UIMessage } from '../types';

  export let message: UIMessage;

  const isUser = message.sender === 'user';

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<div class="bubble-row" class:user={isUser} class:ai={!isUser}>
  {#if !isUser}
    <!-- AI avatar -->
    <div class="avatar" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
    </div>
  {/if}

  <div class="bubble" class:error={message.isError}>
    <p class="text">{message.text}</p>
    <span class="time" aria-label={`Sent at ${formatTime(message.createdAt)}`}>
      {formatTime(message.createdAt)}
    </span>
  </div>
</div>

<style>
  .bubble-row {
    display:     flex;
    align-items: flex-end;
    gap:         0.5rem;
    max-width:   85%;
    animation:   fadeUp 0.2s ease-out;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  /* User messages sit on the right */
  .bubble-row.user {
    align-self:   flex-end;
    flex-direction: row-reverse;
  }

  /* AI messages sit on the left */
  .bubble-row.ai {
    align-self: flex-start;
  }

  /* ── Avatar ────────────────────────────────────────────────────────────── */
  .avatar {
    flex-shrink: 0;
    width:  32px;
    height: 32px;
    border-radius: 50%;
    background: var(--clr-primary-light);
    color:      var(--clr-primary);
    display:    flex;
    align-items:     center;
    justify-content: center;
  }

  /* ── Bubble ────────────────────────────────────────────────────────────── */
  .bubble {
    padding:       0.625rem 0.875rem;
    border-radius: var(--radius-2xl);
    max-width:     100%;
    word-break:    break-word;
    position:      relative;
  }

  .bubble-row.user .bubble {
    background:    linear-gradient(135deg, var(--clr-primary), var(--clr-secondary));
    color:         var(--clr-text-inverse);
    border-bottom-right-radius: var(--radius-sm);
  }

  .bubble-row.ai .bubble {
    background:    var(--clr-surface);
    color:         var(--clr-text);
    border:        1px solid var(--clr-border);
    border-bottom-left-radius: var(--radius-sm);
    box-shadow:    var(--shadow-sm);
  }

  .bubble.error {
    background: var(--clr-error-bg) !important;
    border-color: var(--clr-error) !important;
    color:        var(--clr-error) !important;
  }

  /* ── Text ──────────────────────────────────────────────────────────────── */
  .text {
    font-size:   var(--font-size-sm);
    line-height: 1.55;
    white-space: pre-wrap;
    margin:      0;
  }

  /* ── Timestamp ─────────────────────────────────────────────────────────── */
  .time {
    display:    block;
    font-size:  0.7rem;
    margin-top: 0.25rem;
    opacity:    0.65;
    text-align: right;
  }

  .bubble-row.ai .time {
    text-align: left;
  }
</style>
