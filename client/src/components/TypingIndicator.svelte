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
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(99 102 241 / 0.2);
    color:      var(--clr-primary);
    display:    flex;
    align-items:     center;
    justify-content: center;
    box-shadow: inset 0 1px 0 var(--glass-highlight);
  }

  .bubble {
    display:       flex;
    align-items:   center;
    gap:           5px;
    padding:       0.75rem 1rem;
    background:    var(--glass-bg-strong);
    backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    border:        1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    border-bottom-left-radius: var(--radius-sm);
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
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
