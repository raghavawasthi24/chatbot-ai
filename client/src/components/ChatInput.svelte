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
    background:  var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    border-top:  1px solid var(--glass-border);
    box-shadow: inset 0 1px 0 var(--glass-highlight);
  }

  .input-wrapper {
    flex:     1;
    position: relative;
  }

  textarea {
    width:         100%;
    padding:       0.5rem 0.75rem;
    border:        1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    background:    var(--glass-bg-subtle);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color:         var(--clr-text);
    font-family:   inherit;
    font-size:     var(--font-size-sm);
    line-height:   1.5;
    resize:        none;
    overflow:      hidden;
    transition:    border-color 0.15s, box-shadow 0.15s;
    max-height:    120px;
    overflow-y:    auto;
    box-shadow: inset 0 1px 0 var(--glass-highlight);
  }

  textarea:focus {
    outline:      none;
    border-color: rgba(99 102 241 / 0.5);
    box-shadow:
      0 0 0 3px rgba(99 102 241 / 0.15),
      inset 0 1px 0 var(--glass-highlight);
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
    background:      linear-gradient(135deg, var(--clr-primary), var(--clr-secondary));
    border:          1px solid rgba(255 255 255 / 0.25);
    color:           white;
    display:         flex;
    align-items:     center;
    justify-content: center;
    box-shadow:
      0 4px 12px rgba(99 102 241 / 0.35),
      inset 0 1px 0 rgba(255 255 255 / 0.25);
    transition:      background 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s, box-shadow 0.15s;
  }

  .send-btn:hover:not(:disabled) {
    transform:   scale(1.08);
    box-shadow:  0 6px 20px rgba(99 102 241 / 0.45), inset 0 1px 0 rgba(255 255 255 / 0.3);
  }

  .send-btn:active:not(:disabled) { transform: scale(0.96); }

  .send-btn:disabled {
    opacity: 0.45;
    cursor:  not-allowed;
  }
</style>
