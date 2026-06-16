<script lang="ts">
  import ChatWidget from './components/ChatWidget.svelte';

  const CATEGORIES = [
    { icon: '👗', name: 'Clothing',     count: '1,240+ items' },
    { icon: '📱', name: 'Electronics',  count: '840+ items'   },
    { icon: '🏠', name: 'Home & Living',count: '2,100+ items' },
    { icon: '🎮', name: 'Gaming',       count: '560+ items'   },
    { icon: '📚', name: 'Books',        count: '3,400+ items' },
    { icon: '💄', name: 'Beauty',       count: '920+ items'   },
  ];

  const FEATURES = [
    { icon: '🚚', title: 'Free Shipping',   desc: 'On all orders over $50' },
    { icon: '↩️', title: 'Easy Returns',    desc: '30-day hassle-free returns' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Your data is always protected' },
    { icon: '📞', title: '24/7 Support',    desc: 'AI-powered chat, anytime' },
  ];
</script>

<!-- ── Ambient floating orbs ─────────────────────────────────────────────────── -->
<div class="ambient-orbs" aria-hidden="true">
  <div class="orb orb-1"/>
  <div class="orb orb-2"/>
  <div class="orb orb-3"/>
</div>

<!-- ── Navigation ────────────────────────────────────────────────────────────── -->
<nav class="navbar">
  <div class="container nav-inner">
    <a href="/" class="logo" aria-label="ShopEase home">
      <span class="logo-icon" aria-hidden="true">🛍️</span>
      Shop<span class="logo-accent">Ease</span>
    </a>

    <ul class="nav-links" role="list">
      <li><a href="#categories">Categories</a></li>
      <li><a href="#features">Why us</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>

    <div class="nav-actions">
      <button class="btn-icon" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
      <button class="btn-icon" aria-label="Cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </button>
      <button class="btn btn-primary">Sign in</button>
    </div>
  </div>
</nav>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="container hero-inner">
    <div class="hero-text">
      <span class="badge">✨ Summer sale — up to 60% off</span>
      <h1>Your everyday&nbsp;<em>everything</em> store</h1>
      <p>
        Millions of products. Fast delivery. Hassle-free returns.
        And now — an AI assistant ready to answer your questions instantly.
      </p>
      <div class="hero-cta">
        <button class="btn btn-primary btn-lg">Shop now</button>
        <button class="btn btn-outline btn-lg">Browse deals</button>
      </div>
    </div>

    <div class="hero-visual" aria-hidden="true">
      <div class="hero-card">🛒</div>
      <div class="hero-stat">
        <strong>4.9★</strong>
        <span>250k+ reviews</span>
      </div>
    </div>
  </div>
</section>

<!-- ── Categories ────────────────────────────────────────────────────────────── -->
<section class="section" id="categories">
  <div class="container">
    <h2 class="section-title">Shop by category</h2>
    <p class="section-sub">Explore our curated collections</p>

    <div class="grid-3">
      {#each CATEGORIES as cat}
        <button class="category-card">
          <span class="cat-icon" aria-hidden="true">{cat.icon}</span>
          <span class="cat-name">{cat.name}</span>
          <span class="cat-count">{cat.count}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<!-- ── Features ──────────────────────────────────────────────────────────────── -->
<section class="section section-alt" id="features">
  <div class="container">
    <h2 class="section-title">Why ShopEase?</h2>
    <div class="features-grid">
      {#each FEATURES as feat}
        <div class="feature-card">
          <div class="feat-icon" aria-hidden="true">{feat.icon}</div>
          <h3>{feat.title}</h3>
          <p>{feat.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ── FAQ ───────────────────────────────────────────────────────────────────── -->
<section class="section" id="faq">
  <div class="container faq-container">
    <h2 class="section-title">Have questions?</h2>
    <p class="section-sub">
      Our AI assistant has answers — just click the chat button in the bottom-right corner!
    </p>
    <div class="faq-grid">
      {#each [
        ['What is your return policy?',        'Items can be returned within 30 days.'],
        ['Do you ship internationally?',       'Yes — 50+ countries, tracked & insured.'],
        ['Which payment methods do you accept?','Cards, PayPal, Apple Pay & more.'],
        ['How can I track my order?',          'Use the tracking link in your order email.'],
      ] as [q, a]}
        <div class="faq-card">
          <p class="faq-q">{q}</p>
          <p class="faq-a">{a}</p>
          <p class="faq-cta">Ask our AI for more details →</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ── Footer ────────────────────────────────────────────────────────────────── -->
<footer class="footer">
  <div class="container footer-inner">
    <p class="footer-brand">🛍️ ShopEase</p>
    <p class="footer-copy">© {new Date().getFullYear()} ShopEase Inc. All rights reserved.</p>
    <nav class="footer-links" aria-label="Footer">
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#">Privacy</a>
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#">Terms</a>
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#">Contact</a>
    </nav>
  </div>
</footer>

<!-- ── Floating chat widget (always rendered) ────────────────────────────────── -->
<ChatWidget />

<style>
  /* ── Ambient orbs ────────────────────────────────────────────────────────── */
  .ambient-orbs {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
    animation: float 20s ease-in-out infinite;
  }

  .orb-1 {
    width:  420px;
    height: 420px;
    top:    -80px;
    left:   -100px;
    background: radial-gradient(circle, rgba(99 102 241 / 0.4), transparent 70%);
    animation-delay: 0s;
  }

  .orb-2 {
    width:  350px;
    height: 350px;
    top:    40%;
    right:  -80px;
    background: radial-gradient(circle, rgba(139 92 246 / 0.35), transparent 70%);
    animation-delay: -7s;
  }

  .orb-3 {
    width:  300px;
    height: 300px;
    bottom: 10%;
    left:   30%;
    background: radial-gradient(circle, rgba(6 182 212 / 0.3), transparent 70%);
    animation-delay: -14s;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(30px, -20px) scale(1.05); }
    66%      { transform: translate(-20px, 15px) scale(0.95); }
  }

  /* ── Navbar ──────────────────────────────────────────────────────────────── */
  .navbar {
    position:   sticky;
    top:        0;
    background: var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    border-bottom:   1px solid var(--glass-border);
    box-shadow:
      0 4px 24px rgba(31 38 135 / 0.08),
      inset 0 1px 0 var(--glass-highlight);
    z-index:    100;
  }

  .nav-inner {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    height:          64px;
    gap:             var(--space-4);
  }

  .logo {
    font-size:   var(--font-size-xl);
    font-weight: 700;
    color:       var(--clr-text);
    display:     flex;
    align-items: center;
    gap:         0.375rem;
    text-decoration: none;
  }
  .logo-icon  { font-size: 1.5rem; }
  .logo-accent { color: var(--clr-primary); }

  .nav-links {
    display:    flex;
    list-style: none;
    gap:        var(--space-6);
  }
  .nav-links a {
    color:       var(--clr-text-muted);
    font-size:   var(--font-size-sm);
    font-weight: 500;
    transition:  color 0.15s;
  }
  .nav-links a:hover { color: var(--clr-primary); text-decoration: none; }

  .nav-actions {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
  }

  /* ── Buttons ─────────────────────────────────────────────────────────────── */
  .btn {
    padding:       0.5rem 1.25rem;
    border-radius: var(--radius-full);
    font-weight:   600;
    font-size:     var(--font-size-sm);
    transition:    background 0.15s, transform 0.1s, box-shadow 0.15s;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--clr-primary), var(--clr-secondary));
    color:      white;
    box-shadow:
      0 4px 16px rgba(99 102 241 / 0.35),
      inset 0 1px 0 rgba(255 255 255 / 0.25);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, var(--clr-primary-dark), var(--clr-secondary));
    box-shadow: 0 6px 24px rgba(99 102 241 / 0.45);
    transform: translateY(-1px);
  }
  .btn-outline {
    background: var(--glass-bg-subtle);
    backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    border:     1.5px solid rgba(99 102 241 / 0.4);
    color:      var(--clr-primary);
    box-shadow: inset 0 1px 0 var(--glass-highlight);
  }
  .btn-outline:hover {
    background: rgba(99 102 241 / 0.12);
    border-color: var(--clr-primary);
    transform: translateY(-1px);
  }
  .btn-lg { padding: 0.75rem 2rem; font-size: var(--font-size-base); }
  .btn-icon {
    width:         36px;
    height:        36px;
    border-radius: 50%;
    display:       flex;
    align-items:   center;
    justify-content: center;
    color:         var(--clr-text-muted);
    transition:    background 0.15s;
  }
  .btn-icon {
    background: var(--glass-bg-subtle);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border-subtle);
  }
  .btn-icon:hover {
    background: rgba(99 102 241 / 0.15);
    color: var(--clr-primary);
    border-color: rgba(99 102 241 / 0.3);
  }

  /* ── Hero ───────────────────────────────────────────────────────────────── */
  .hero {
    padding:    var(--space-16) 0;
    position:   relative;
    background: transparent;
  }
  .hero-inner {
    display:     flex;
    align-items: center;
    gap:         var(--space-12);
  }
  .hero-text { flex: 1; }
  .badge {
    display:       inline-block;
    padding:       0.35rem 0.875rem;
    background:    var(--glass-bg);
    backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(12px) saturate(var(--glass-saturate));
    color:         var(--clr-primary-dark);
    border:        1px solid rgba(99 102 241 / 0.25);
    border-radius: var(--radius-full);
    font-size:     var(--font-size-sm);
    font-weight:   600;
    margin-bottom: var(--space-4);
    box-shadow: inset 0 1px 0 var(--glass-highlight);
  }
  .hero-text h1 {
    font-size:   clamp(2rem, 4vw, 3.25rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: var(--space-4);
    color:       var(--clr-text);
  }
  .hero-text h1 em { color: var(--clr-primary); font-style: normal; }
  .hero-text p {
    font-size:     var(--font-size-lg);
    color:         var(--clr-text-muted);
    max-width:     480px;
    margin-bottom: var(--space-8);
  }
  .hero-cta { display: flex; gap: var(--space-4); flex-wrap: wrap; }

  .hero-visual {
    flex-shrink: 0;
    position:    relative;
  }
  .hero-card {
    width:         220px;
    height:        220px;
    border-radius: var(--radius-2xl);
    background:    linear-gradient(135deg,
      rgba(99 102 241 / 0.85),
      rgba(139 92 246 / 0.85));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border:        1px solid rgba(255 255 255 / 0.35);
    display:       flex;
    align-items:   center;
    justify-content: center;
    font-size:     6rem;
    box-shadow:
      var(--glass-shadow-lg),
      inset 0 1px 0 rgba(255 255 255 / 0.4),
      0 0 60px rgba(99 102 241 / 0.25);
    animation: heroPulse 4s ease-in-out infinite;
  }

  @keyframes heroPulse {
    0%, 100% { box-shadow: var(--glass-shadow-lg), inset 0 1px 0 rgba(255 255 255 / 0.4), 0 0 60px rgba(99 102 241 / 0.25); }
    50%      { box-shadow: var(--glass-shadow-lg), inset 0 1px 0 rgba(255 255 255 / 0.4), 0 0 80px rgba(139 92 246 / 0.35); }
  }

  .hero-stat {
    position:      absolute;
    bottom:        -1rem;
    left:          -1rem;
    background:    var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    border:        1px solid var(--glass-border);
    padding:       0.75rem 1rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
    display:       flex;
    flex-direction: column;
    align-items:   center;
  }
  .hero-stat strong { font-size: var(--font-size-lg); color: var(--clr-primary); }
  .hero-stat span   { font-size: var(--font-size-sm);  color: var(--clr-text-muted); }

  /* ── Sections ────────────────────────────────────────────────────────────── */
  .section     { padding: var(--space-16) 0; position: relative; z-index: 1; }
  .section-alt {
    background: var(--glass-bg-subtle);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-top:    1px solid var(--glass-border-subtle);
    border-bottom: 1px solid var(--glass-border-subtle);
  }
  .section-title {
    font-size:     var(--font-size-3xl);
    font-weight:   800;
    text-align:    center;
    margin-bottom: var(--space-2);
  }
  .section-sub {
    text-align:    center;
    color:         var(--clr-text-muted);
    margin-bottom: var(--space-8);
  }

  /* ── Category grid ───────────────────────────────────────────────────────── */
  .grid-3 {
    display:               grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap:                   var(--space-4);
  }
  .category-card {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            var(--space-2);
    padding:        var(--space-6);
    background:     var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    border:         1px solid var(--glass-border);
    border-radius:  var(--radius-xl);
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
    transition:     border-color 0.2s, box-shadow 0.25s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor:         pointer;
  }
  .category-card:hover {
    border-color: rgba(99 102 241 / 0.4);
    box-shadow: var(--glass-shadow-lg), inset 0 1px 0 var(--glass-highlight), 0 0 0 1px rgba(99 102 241 / 0.1);
    transform:    translateY(-4px);
  }
  .cat-icon  { font-size: 2.25rem; }
  .cat-name  { font-weight: 600; }
  .cat-count { font-size: var(--font-size-sm); color: var(--clr-text-muted); }

  /* ── Features ────────────────────────────────────────────────────────────── */
  .features-grid {
    display:               grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap:                   var(--space-6);
  }
  .feature-card {
    text-align: center;
    padding:    var(--space-6);
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    border:     1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--glass-shadow-lg), inset 0 1px 0 var(--glass-highlight);
  }
  .feat-icon { font-size: 2.5rem; margin-bottom: var(--space-4); }
  .feature-card h3 { font-weight: 700; margin-bottom: var(--space-2); }
  .feature-card p  { color: var(--clr-text-muted); font-size: var(--font-size-sm); }

  /* ── FAQ ─────────────────────────────────────────────────────────────────── */
  .faq-container { max-width: 800px; }
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-4);
  }
  .faq-card {
    padding:       var(--space-6);
    border:        1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    background:    var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .faq-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow-lg), inset 0 1px 0 var(--glass-highlight);
    border-color: rgba(99 102 241 / 0.3);
  }
  .faq-q   { font-weight: 600; margin-bottom: var(--space-2); }
  .faq-a   { color: var(--clr-text-muted); font-size: var(--font-size-sm); margin-bottom: var(--space-2); }
  .faq-cta { font-size: var(--font-size-sm); color: var(--clr-primary); font-weight: 500; }

  /* ── Footer ──────────────────────────────────────────────────────────────── */
  .footer {
    background:   var(--glass-bg-dark);
    backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate));
    border-top:   1px solid rgba(255 255 255 / 0.1);
    color:        white;
    padding:      var(--space-8) 0;
    position:     relative;
    z-index:      1;
    box-shadow: inset 0 1px 0 rgba(255 255 255 / 0.08);
  }
  .footer-inner {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    flex-wrap:       wrap;
    gap:             var(--space-4);
  }
  .footer-brand { font-size: var(--font-size-xl); font-weight: 700; }
  .footer-copy  { color: #94a3b8; font-size: var(--font-size-sm); }
  .footer-links { display: flex; gap: var(--space-6); }
  .footer-links a { color: #94a3b8; font-size: var(--font-size-sm); transition: color 0.15s; }
  .footer-links a:hover { color: white; text-decoration: none; }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .hero-inner    { flex-direction: column; text-align: center; }
    .hero-text p   { max-width: 100%; }
    .hero-cta      { justify-content: center; }
    .hero-visual   { display: none; }
    .nav-links     { display: none; }
    .footer-inner  { flex-direction: column; text-align: center; }
  }
</style>
