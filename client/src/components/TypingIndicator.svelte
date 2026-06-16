<script lang="ts">
  // No props needed — purely presentational
</script>

<div class="typing-row" role="status" aria-label="Agent is typing">
  <div class="avatar" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12h8M12 8v8"/>
    </svg>
  </div>

  <div class="bubble">
    <span class="dot" style="animation-delay: 0ms"   />
    <span class="dot" style="animation-delay: 160ms"  />
    <span class="dot" style="animation-delay: 320ms"  />
  </div>
</div>

<style>
  .typing-row {
    display:     flex;
    align-items: flex-end;
    gap:         0.5rem;
    align-self:  flex-start;
    animation:   fadeUp 0.2s ease-out;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

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

  .bubble {
    display:       flex;
    align-items:   center;
    gap:           5px;
    padding:       0.75rem 1rem;
    background:    var(--clr-surface);
    border:        1px solid var(--clr-border);
    border-radius: var(--radius-2xl);
    border-bottom-left-radius: var(--radius-sm);
    box-shadow:    var(--shadow-sm);
  }

  .dot {
    width:         8px;
    height:        8px;
    border-radius: 50%;
    background:    var(--clr-text-muted);
    animation:     bounce 1.2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0);     opacity: 0.4; }
    30%            { transform: translateY(-6px);  opacity: 1;   }
  }
</style>
