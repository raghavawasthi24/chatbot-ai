<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled  = false;
  export let maxLength = 2000;

  const dispatch = createEventDispatcher<{ send: string }>();

  let value    = '';
  let textarea: HTMLTextAreaElement;

  $: charCount       = value.length;
  $: nearLimit       = charCount > maxLength * 0.8;
  $: atLimit         = charCount >= maxLength;
  $: canSend         = value.trim().length > 0 && !disabled && !atLimit;

  /** Auto-grow textarea up to max-height (set via CSS). */
  const resize = () => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleInput = () => resize();

  const submit = () => {
    const text = value.trim();
    if (!text || disabled || atLimit) return;
    dispatch('send', text);
    value = '';
    // Reset height after clearing
    if (textarea) { textarea.style.height = 'auto'; }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };
</script>

<div class="input-area">
  <div class="input-wrapper">
    <textarea
      bind:this={textarea}
      bind:value
      on:input={handleInput}
      on:keydown={handleKeydown}
      maxlength={maxLength}
      placeholder="Ask me anything…"
      rows="1"
      aria-label="Chat message"
      {disabled}
    />

    {#if nearLimit}
      <span class="char-count" class:at-limit={atLimit}>
        {charCount}/{maxLength}
      </span>
    {/if}
  </div>

  <button
    class="send-btn"
    on:click={submit}
    disabled={!canSend}
    aria-label="Send message"
    title="Send (Enter)"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  </button>
</div>

<style>
  .input-area {
    display:     flex;
    align-items: flex-end;
    gap:         0.5rem;
    padding:     0.75rem;
    background:  var(--clr-surface);
    border-top:  1px solid var(--clr-border);
  }

  .input-wrapper {
    flex:     1;
    position: relative;
  }

  textarea {
    width:         100%;
    padding:       0.5rem 0.75rem;
    border:        1.5px solid var(--clr-border);
    border-radius: var(--radius-xl);
    background:    var(--clr-bg);
    color:         var(--clr-text);
    font-family:   inherit;
    font-size:     var(--font-size-sm);
    line-height:   1.5;
    resize:        none;
    overflow:      hidden; /* grows via JS */
    transition:    border-color 0.15s;
    max-height:    120px;
    overflow-y:    auto;
  }

  textarea:focus {
    outline:      none;
    border-color: var(--clr-primary);
    box-shadow:   0 0 0 3px var(--clr-primary-light);
  }

  textarea:disabled {
    opacity: 0.6;
    cursor:  not-allowed;
  }

  textarea::placeholder { color: var(--clr-text-muted); }

  /* ── Char counter ───────────────────────────────────────────────────────── */
  .char-count {
    position:   absolute;
    bottom:     0.4rem;
    right:      0.75rem;
    font-size:  0.7rem;
    color:      var(--clr-text-muted);
    pointer-events: none;
  }

  .char-count.at-limit { color: var(--clr-error); }

  /* ── Send button ────────────────────────────────────────────────────────── */
  .send-btn {
    flex-shrink:     0;
    width:           40px;
    height:          40px;
    border-radius:   50%;
    background:      var(--clr-primary);
    color:           white;
    display:         flex;
    align-items:     center;
    justify-content: center;
    transition:      background 0.15s, transform 0.1s, opacity 0.15s;
  }

  .send-btn:hover:not(:disabled) {
    background:  var(--clr-primary-dark);
    transform:   scale(1.05);
  }

  .send-btn:active:not(:disabled) { transform: scale(0.96); }

  .send-btn:disabled {
    opacity: 0.45;
    cursor:  not-allowed;
  }
</style>
