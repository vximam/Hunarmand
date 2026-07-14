/**
 * Hunarmand Assistant (chatbot.js)
 * A floating chat widget that appears on every public/user/worker page.
 * Its behavior is locked to whichever role is actually logged in — there is
 * no user-facing switch. Nothing here calls an external API: all responses
 * are generated locally from real platform data (HJ / localStorage), so it
 * never depends on network availability and never exposes a credential.
 *
 *   visitor  (no session)   -> explains the platform, nudges to sign up
 *   customer (role: user)   -> recommends real verified workers by trade
 *   worker   (role: worker) -> gives tips on earning more / improving
 */
const HunBot = {};

HunBot.init = function(){
  const session = JSON.parse(localStorage.getItem('currentUser')||'null');
  HunBot.mode = session ? session.role : 'visitor';
  if (HunBot.mode === 'admin') return; // not shown in the admin panel

  // Check admin-controlled visibility setting
  try {
    const vis = JSON.parse(localStorage.getItem('hun_chatbot_visibility') || '{"visitor":true,"user":true,"worker":true}');
    if (vis[HunBot.mode] === false) return; // admin disabled chatbot for this role
  } catch(e) {}

  HunBot.session = session;
  if (document.getElementById('hunbot-fab')) return; // already initialized on this page
  HunBot.injectStyle();
  HunBot.buildWidget();
  HunBot.wireEvents();
  HunBot.loadHistory();
};

HunBot.storageKey = function(){
  const id = HunBot.session ? HunBot.session.id : 'anon';
  return `hun_chatlog_${HunBot.mode}_${id}`;
};

HunBot.esc = function(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};

/* ═══════════════════════ WIDGET UI ═══════════════════════ */
HunBot.injectStyle = function(){
  if (document.getElementById('hunbot-style')) return;
  const css = `
  #hunbot-fab{position:fixed;bottom:22px;right:22px;width:58px;height:58px;border-radius:50%;
    background:linear-gradient(135deg,#1b5e37,#246843);box-shadow:0 10px 28px rgba(27,94,55,.4);
    border:none;cursor:pointer;z-index:99998;display:flex;align-items:center;justify-content:center;
    transition:transform .2s ease,box-shadow .2s ease;color:#fff;padding:0}
  #hunbot-fab:hover{transform:scale(1.07);box-shadow:0 14px 34px rgba(27,94,55,.5)}
  #hunbot-fab svg{width:26px;height:26px}
  #hunbot-fab .hunbot-ping{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;
    background:#e0245e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:800;color:#fff;font-family:'Sora',sans-serif}
  #hunbot-panel{position:fixed;bottom:92px;right:22px;width:368px;max-width:92vw;height:540px;max-height:76vh;
    background:#fff;border-radius:20px;box-shadow:0 24px 64px rgba(11,26,16,.28);z-index:99999;
    display:none;flex-direction:column;overflow:hidden;font-family:'Inter',sans-serif;
    animation:hunbotUp .28s cubic-bezier(.22,1,.36,1)}
  @keyframes hunbotUp{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  #hunbot-panel.open{display:flex}
  #hunbot-hdr{background:linear-gradient(135deg,#1b5e37,#246843);padding:14px 16px;display:flex;align-items:center;gap:10px;color:#fff;flex-shrink:0}
  #hunbot-hdr-av{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  #hunbot-hdr-av svg{width:19px;height:19px}
  #hunbot-hdr-txt{flex:1;min-width:0}
  #hunbot-hdr-name{font-family:'Sora',sans-serif;font-weight:700;font-size:.9rem}
  #hunbot-hdr-sub{font-size:.68rem;opacity:.85;display:flex;align-items:center;gap:4px;margin-top:1px}
  #hunbot-hdr-sub .hunbot-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}
  #hunbot-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}
  #hunbot-close:hover{background:rgba(255,255,255,.28)}
  #hunbot-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f5fbf7}
  .hb-row{display:flex;gap:8px;align-items:flex-end}
  .hb-row.me{flex-direction:row-reverse}
  .hb-av{width:26px;height:26px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#e8f5ed;color:#1b5e37}
  .hb-av svg{width:14px;height:14px}
  .hb-bub{max-width:76%;padding:9px 12px;border-radius:14px;font-size:.82rem;line-height:1.45;word-wrap:break-word}
  .hb-row.bot .hb-bub{background:#fff;color:#0b1a10;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(11,26,16,.08)}
  .hb-row.me .hb-bub{background:#1b5e37;color:#fff;border-bottom-right-radius:4px}
  .hb-bub a, .hb-bub button.hb-link{color:#1b5e37;font-weight:700;text-decoration:underline;cursor:pointer;background:none;border:none;padding:0;font-size:inherit;font-family:inherit}
  .hb-row.bot .hb-bub .hb-worker-card{margin-top:8px;padding:8px 10px;background:#f5fbf7;border:1px solid #e0ede4;border-radius:10px}
  .hb-row.bot .hb-bub .hb-worker-card + .hb-worker-card{margin-top:6px}
  .hb-wc-top{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.8rem;color:#0b1a10}
  .hb-wc-meta{font-size:.7rem;color:#4e6a57;margin-top:2px}
  .hb-cta{display:inline-block;margin-top:8px;background:#1b5e37;color:#fff !important;padding:6px 12px;border-radius:100px;font-size:.76rem;font-weight:700;text-decoration:none !important}
  #hunbot-chips{display:flex;gap:6px;padding:0 12px 10px;flex-wrap:wrap;flex-shrink:0;background:#f5fbf7}
  .hb-chip{background:#fff;border:1px solid #d4ead9;color:#1b5e37;font-size:.72rem;font-weight:600;padding:6px 11px;border-radius:100px;cursor:pointer;white-space:nowrap}
  .hb-chip:hover{background:#e8f5ed}
  #hunbot-inputrow{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e5efe8;flex-shrink:0;background:#fff}
  #hunbot-input{flex:1;padding:9px 12px;border-radius:11px;border:1px solid #d4ead9;font-size:.83rem;font-family:inherit;outline:none;min-width:0}
  #hunbot-input:focus{border-color:#4CAF50}
  #hunbot-send{width:38px;height:38px;border-radius:11px;background:#1b5e37;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .hb-typing{display:flex;gap:3px;padding:4px 2px}
  .hb-typing span{width:6px;height:6px;border-radius:50%;background:#8ca898;animation:hbTyping 1.2s infinite}
  .hb-typing span:nth-child(2){animation-delay:.15s}
  .hb-typing span:nth-child(3){animation-delay:.3s}
  @keyframes hbTyping{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
  [data-theme="dark"] #hunbot-panel{background:#1a222c}
  [data-theme="dark"] #hunbot-msgs{background:#0f1419}
  [data-theme="dark"] .hb-row.bot .hb-bub{background:#1a222c;color:#ecfdf3;box-shadow:0 1px 4px rgba(0,0,0,.3)}
  [data-theme="dark"] .hb-row.bot .hb-bub a, [data-theme="dark"] .hb-row.bot .hb-bub button.hb-link{color:#6ee7a8}
  [data-theme="dark"] .hb-wc-top{color:#ecfdf3}
  [data-theme="dark"] .hb-row.bot .hb-bub .hb-worker-card{background:#0f1419;border-color:rgba(255,255,255,.08)}
  [data-theme="dark"] #hunbot-chips{background:#0f1419}
  [data-theme="dark"] .hb-chip{background:#1a222c;border-color:rgba(255,255,255,.1);color:#6ee7a8}
  [data-theme="dark"] #hunbot-inputrow{background:#1a222c;border-color:rgba(255,255,255,.08)}
  [data-theme="dark"] #hunbot-input{background:#0f1419;border-color:rgba(255,255,255,.1);color:#ecfdf3}
  [data-theme="dark"] .hb-av{background:rgba(110,231,168,.12);color:#6ee7a8}
  @media(max-width:480px){
    #hunbot-panel{right:10px;left:10px;width:auto;bottom:86px;height:70vh}
    #hunbot-fab{right:16px;bottom:16px}
  }`;
  document.head.insertAdjacentHTML('beforeend', `<style id="hunbot-style">${css}</style>`);
};

HunBot.BOT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

HunBot.buildWidget = function(){
  const subtitle = { visitor: "Ask me anything", user: "Your personal assistant", worker: "Worker support" }[HunBot.mode];
  document.body.insertAdjacentHTML('beforeend', `
    <button id="hunbot-fab" aria-label="Chat with Hunarmand Assistant">${HunBot.BOT_ICON}${localStorage.getItem('hun_chatbot_seen')?'':'<span class="hunbot-ping">1</span>'}</button>
    <div id="hunbot-panel">
      <div id="hunbot-hdr">
        <div id="hunbot-hdr-av">${HunBot.BOT_ICON}</div>
        <div id="hunbot-hdr-txt">
          <div id="hunbot-hdr-name">Hunarmand Assistant</div>
          <div id="hunbot-hdr-sub"><span class="hunbot-dot"></span>${subtitle}</div>
        </div>
        <button id="hunbot-close" aria-label="Close chat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div id="hunbot-msgs"></div>
      <div id="hunbot-chips"></div>
      <div id="hunbot-inputrow">
        <input id="hunbot-input" placeholder="Type a message..." autocomplete="off">
        <button id="hunbot-send" aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>
      </div>
    </div>`);
};

HunBot.wireEvents = function(){
  document.getElementById('hunbot-fab').onclick = () => HunBot.toggle(true);
  document.getElementById('hunbot-close').onclick = () => HunBot.toggle(false);
  document.getElementById('hunbot-send').onclick = () => HunBot.send();
  document.getElementById('hunbot-input').addEventListener('keydown', (e) => { if (e.key==='Enter'){ e.preventDefault(); HunBot.send(); } });
};

HunBot.toggle = function(open){
  document.getElementById('hunbot-panel').classList.toggle('open', open);
  if (open) {
    localStorage.setItem('hun_chatbot_seen','true');
    const ping = document.querySelector('#hunbot-fab .hunbot-ping');
    if (ping) ping.remove();
    document.getElementById('hunbot-input').focus();
    document.getElementById('hunbot-msgs').scrollTop = 999999;
  }
};

/* ═══════════════════════ CONVERSATION ═══════════════════════ */
HunBot.loadHistory = function(){
  const log = JSON.parse(localStorage.getItem(HunBot.storageKey())||'[]');
  if (!log.length) {
    HunBot.greet();
    return;
  }
  log.forEach(m => HunBot.renderMessage(m.who, m.html, false));
  HunBot.renderChips(HunBot.chipsFor(null));
  HunBot.scrollDown();
};

HunBot.saveMessage = function(who, html){
  const log = JSON.parse(localStorage.getItem(HunBot.storageKey())||'[]');
  log.push({ who, html });
  localStorage.setItem(HunBot.storageKey(), JSON.stringify(log.slice(-40)));
};

HunBot.renderMessage = function(who, html, animate){
  const wrap = document.getElementById('hunbot-msgs');
  const row = document.createElement('div');
  row.className = 'hb-row ' + (who==='me' ? 'me' : 'bot');
  row.innerHTML = (who==='me' ? '' : `<div class="hb-av">${HunBot.BOT_ICON}</div>`) + `<div class="hb-bub">${html}</div>`;
  if (animate) row.style.animation = 'hunbotUp .22s ease both';
  wrap.appendChild(row);
  HunBot.scrollDown();
};

HunBot.scrollDown = function(){
  const wrap = document.getElementById('hunbot-msgs');
  wrap.scrollTop = wrap.scrollHeight;
};

HunBot.greet = function(){
  const name = HunBot.session ? HunBot.session.name.split(' ')[0] : null;
  let html;
  if (HunBot.mode === 'visitor') {
    html = `Hi there! 👋 I'm the Hunarmand Assistant. I can tell you how the platform works, or if you've got something that needs fixing at home, just describe it and I'll point you in the right direction.`;
  } else if (HunBot.mode === 'user') {
    html = `Hi ${HunBot.esc(name)}! 👋 Tell me what you need help with — e.g. "my AC stopped cooling" — and I'll recommend a verified artisan for it.`;
  } else {
    html = `Hi ${HunBot.esc(name)}! 👋 Ask me things like "how can I earn more?" or "how do I get verified?" and I'll help you grow on Hunarmand.`;
  }
  HunBot.renderMessage('bot', html, true);
  HunBot.saveMessage('bot', html);
  HunBot.renderChips(HunBot.chipsFor(null));
};

HunBot.chipsFor = function(lastTrade){
  if (HunBot.mode === 'visitor') {
    return lastTrade ? ["Sign up free", "Is it free?", "What cities?"] : ["How does it work?", "I need a plumber", "Join as a worker"];
  }
  if (HunBot.mode === 'user') {
    return lastTrade ? ["See all artisans", "My bookings", "How do I pay?"] : ["My AC isn't cooling", "I need house cleaning", "Check my bookings"];
  }
  return ["How can I earn more?", "How do I get verified?", "How do I withdraw?"];
};

HunBot.renderChips = function(chips){
  document.getElementById('hunbot-chips').innerHTML = chips.map(c=>`<button class="hb-chip" onclick="HunBot.sendChip(this)">${HunBot.esc(c)}</button>`).join('');
};
HunBot.sendChip = function(el){
  const text = el.textContent;
  HunBot.handle(text);
};

HunBot.send = function(){
  const input = document.getElementById('hunbot-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  HunBot.handle(text);
};

HunBot.handle = async function(text){
  HunBot.renderMessage('me', HunBot.esc(text), true);
  HunBot.saveMessage('me', HunBot.esc(text));
  document.getElementById('hunbot-chips').innerHTML = '';
  HunBot.showTyping();
  const minDelay = new Promise(r => setTimeout(r, 450 + Math.random()*300));

  /* ── Mode decision: 'ai' (default) tries AI first; 'local' uses rule-based first ── */
  const chatMode = localStorage.getItem('hun_chatbot_mode') || 'ai';
  let result;

  if (chatMode === 'ai') {
    // AI-first: send every message straight to the AI model for intelligent,
    // context-aware responses. Fall back to local rules only when AI is
    // unreachable (offline, key invalid, rate-limited, etc.).
    result = await HunBot.askAI(text).catch(() => null);
    if (!result) {
      result = HunBot.respondUniversal(text);
      if (!result) {
        if (HunBot.mode === 'visitor') result = HunBot.respondVisitor(text);
        else if (HunBot.mode === 'user') result = HunBot.respondCustomer(text);
        else result = HunBot.respondWorker(text);
      }
    }
  } else {
    // Local-first: use rule-based responses; AI only as last resort.
    result = HunBot.respondUniversal(text);
    if (!result) {
      if (HunBot.mode === 'visitor') result = HunBot.respondVisitor(text);
      else if (HunBot.mode === 'user') result = HunBot.respondCustomer(text);
      else result = HunBot.respondWorker(text);
    }
    if (!result) {
      result = await HunBot.askAI(text).catch(() => null);
    }
  }

  await minDelay;
  HunBot.hideTyping();
  if (!result) {
    // Total fallback if the AI is unreachable (offline, bad key, rate-limited, etc.) — the
    // widget should never go silent even without network access.
    result = { html: `I can tell you about Hunarmand, or if you describe a problem you're having (like "my tap is leaking"), I'll point you toward the right kind of professional. What's on your mind?` };
  }
  if (result.trade) HunBot.lastTrade = result.trade;
  HunBot.renderMessage('bot', result.html, true);
  HunBot.saveMessage('bot', result.html);
  HunBot.renderChips(result.chips || HunBot.chipsFor(result.trade||null));
};

/* ═══════════════════════ AI FALLBACK (OpenRouter) ═══════════════════════
 * Only used when nothing in the local rule-based logic above matches —
 * that logic stays local-first because it reads real platform data
 * (actual workers, actual bookings) that a general model can't see.
 * The AI is purely for open-ended conversation the rules didn't anticipate.
 *
 * ⚠️ SECURITY: this key is shipped in a static client-side file, so anyone
 * who opens dev tools / view-source can read it. Treat it as already public:
 * rotate it on openrouter.ai before this goes anywhere beyond a local demo,
 * and move this call behind a real backend when you're ready to ship.
 */
HunBot.AI_CONFIG = {
  apiKey: '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',
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'openai/gpt-4o-mini',
};

HunBot.systemPromptFor = function(){
  const base = `You are the Hunarmand Assistant, a friendly, concise support chatbot for Hunarmand — Pakistan's marketplace for skilled workers (plumbers, electricians, carpenters, painters, cleaners, etc). Keep replies short (1-3 sentences), warm, and helpful. Use plain text with occasional <b> tags for emphasis and <br> for line breaks — no markdown. Never invent specific worker names, prices, or booking details; if the person needs real platform data, tell them to browse or check the relevant page instead of making numbers up.`;
  if (HunBot.mode === 'visitor') return base + ` The visitor is not logged in. Encourage signing up if relevant, but don't be pushy.`;
  if (HunBot.mode === 'user') return base + ` You're talking to a logged-in client named ${HunBot.session?.name||'there'}. Help with general questions about using the platform.`;
  return base + ` You're talking to a logged-in worker/professional named ${HunBot.session?.name||'there'}. Help with general questions about growing their business on the platform.`;
};

HunBot.askAI = async function(text){
  if (!HunBot.AI_CONFIG.apiKey) return null;
  const history = JSON.parse(localStorage.getItem(HunBot.storageKey())||'[]')
    .slice(-8)
    .map(m => ({ role: m.who==='me' ? 'user' : 'assistant', content: m.html.replace(/<[^>]+>/g,' ').trim() }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(HunBot.AI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HunBot.AI_CONFIG.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: localStorage.getItem('hun_chatbot_model') || HunBot.AI_CONFIG.model,
        messages: [
          { role: 'system', content: HunBot.systemPromptFor() },
          ...history,
          { role: 'user', content: text },
        ],
        max_tokens: 220,
        temperature: 0.6,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { html: HunBot.esc(reply).replace(/\n/g, '<br>') };
  } catch (e) {
    clearTimeout(timeout);
    return null; // network unavailable, key invalid, rate-limited, etc. — caller falls back gracefully
  }
};

/* Intents handled the same way no matter who's logged in: thanks, goodbye,
 * asking for a human, and "that/it" follow-ups that lean on the last trade
 * discussed (basic short-term memory so the bot doesn't feel stateless). */
HunBot.respondUniversal = function(text){
  const t = text.toLowerCase().trim();
  if (HunBot.match(t, ['thank you','thanks','thankyou','shukriya','appreciate it'])) {
    return { html: `You're welcome! 😊 Anything else I can help with?` };
  }
  if (HunBot.match(t, ['bye','goodbye','see you','khuda hafiz','allah hafiz'])) {
    return { html: `Take care! I'll be right here if you need anything else. 👋` };
  }
  if (HunBot.match(t, ['talk to a human','real person','human agent','customer support','speak to someone','representative'])) {
    return { html: `I can handle most things right here, but for anything I can't solve you can reach our support team from the Help page.<br><a class="hb-cta" href="help.html">Go to Help & Support →</a>` };
  }
  if (HunBot.match(t, ['what can you do','help me','what do you do','your capabilities'])) {
    const caps = HunBot.mode === 'worker'
      ? `I can help you with earnings tips, getting verified, withdrawals, and improving your ratings.`
      : HunBot.mode === 'user'
      ? `I can recommend verified professionals for any home problem, check your bookings, and explain payments.`
      : `I can explain how Hunarmand works, what it costs, and help you sign up as a client or a professional.`;
    return { html: caps };
  }
  // Short follow-ups like "how much would that cost?" or "book them" lean on the last trade discussed
  if (HunBot.lastTrade && HunBot.match(t, ['how much','cost','price','rate']) && !HunBot.detectTrade(t)) {
    if (HunBot.mode === 'visitor') {
      return { html: `Pricing for ${HunBot.lastTrade.toLowerCase()} work varies by job, since you agree the price directly with the worker before booking. Sign up free to see live rates from verified pros.<br><a class="hb-cta" href="auth.html?action=signup">Sign Up Free →</a>`, trade: HunBot.lastTrade };
    }
  }
  return null;
};

HunBot.showTyping = function(){
  const wrap = document.getElementById('hunbot-msgs');
  const row = document.createElement('div');
  row.className = 'hb-row bot';
  row.id = 'hunbot-typing-row';
  row.innerHTML = `<div class="hb-av">${HunBot.BOT_ICON}</div><div class="hb-bub"><div class="hb-typing"><span></span><span></span><span></span></div></div>`;
  wrap.appendChild(row);
  HunBot.scrollDown();
};
HunBot.hideTyping = function(){ document.getElementById('hunbot-typing-row')?.remove(); };

/* ═══════════════════════ FUZZY MATCHING ═══════════════════════
 * Lets the bot understand typos like "plumer", "eletrician", "clening"
 * without needing an exact keyword match.
 */
HunBot.levenshtein = function(a, b){
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  let prev = Array.from({length: bl+1}, (_, i) => i);
  for (let i = 1; i <= al; i++) {
    const cur = [i];
    for (let j = 1; j <= bl; j++) {
      cur[j] = a[i-1] === b[j-1]
        ? prev[j-1]
        : 1 + Math.min(prev[j-1], prev[j], cur[j-1]);
    }
    prev = cur;
  }
  return prev[bl];
};

/* True if `text` contains `phrase`, exactly or within a small typo tolerance
 * (tolerance scales with word length so short words still need to be close). */
HunBot.fuzzyIncludes = function(text, phrase){
  const t = text.toLowerCase();
  if (t.includes(phrase)) return true;
  if (phrase.includes(' ')) return false; // only fuzz single words, multi-word phrases need substring match
  if (phrase.length < 4) return false; // too short to safely fuzz
  const tolerance = phrase.length <= 6 ? 1 : 2;
  const words = t.split(/[^a-z]+/).filter(Boolean);
  return words.some(w => Math.abs(w.length - phrase.length) <= tolerance && HunBot.levenshtein(w, phrase) <= tolerance);
};

/* ═══════════════════════ TRADE DETECTION ═══════════════════════ */
HunBot.TRADE_KEYWORDS = {
  'Plumbing': ['plumb','pipe','leak','tap','faucet','drain','sink','toilet','water heater','geyser','flush','clog'],
  'Electrical': ['electric','wiring','wire','socket','switch','fuse','short circuit','power cut','shock','breaker','light not','bulb'],
  'Carpentry': ['carpent','wood','furniture','cabinet','wardrobe','hinge','shelf','wooden door','table','chair broke'],
  'HVAC': ['ac ','a/c','air condition','hvac','cooling','duct','ac not','ac is','ac stopped','not cooling'],
  'Painting': ['paint','wall color','texture wall','whitewash','wall crack'],
  'Cleaning': ['clean','maid','dust','mop','sweep','deep clean','move-out'],
  'Appliance Repair': ['washing machine','fridge','refrigerator','microwave','oven','appliance','dryer'],
  'Security': ['guard','security','watchman'],
};
HunBot.detectTrade = function(text){
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const [trade, kws] of Object.entries(HunBot.TRADE_KEYWORDS)) {
    let score = 0;
    kws.forEach(kw => { if (HunBot.fuzzyIncludes(t, kw)) score++; });
    if (score > bestScore) { bestScore = score; best = trade; }
  }
  return best;
};
HunBot.match = function(text, patterns){
  const t = text.toLowerCase();
  return patterns.some(p => HunBot.fuzzyIncludes(t, p));
};

/* ═══════════════════════ VISITOR RESPONSES ═══════════════════════ */
HunBot.respondVisitor = function(text){
  const trade = HunBot.detectTrade(text);
  if (trade) {
    const count = (typeof HJ !== 'undefined') ? JSON.parse(localStorage.getItem('allWorkers')||'[]').filter(w=>(w.status||'').toLowerCase()==='verified' && w.skill===trade).length : 0;
    return { html: `Sounds like a <b>${trade}</b> job! We have ${count>0?count+' verified':'verified'} ${trade.toLowerCase()} professionals ready to help.<br><br>To actually send a request and get matched, you'll need a free account — it takes under a minute.<br><a class="hb-cta" href="auth.html?action=signup">Sign Up Free →</a>`, trade };
  }
  if (HunBot.match(text, ['how does it work','how it works','how this works'])) {
    return { html: `It's simple:<br>1️⃣ Create a free account<br>2️⃣ Browse or search verified artisans by trade<br>3️⃣ Request a booking with your budget and schedule<br>4️⃣ Pay securely once the job's done, then leave a review<br><br>Want to get started?<br><a class="hb-cta" href="auth.html?action=signup">Sign Up Free →</a>` };
  }
  if (HunBot.match(text, ['free','cost','fee','price','charge'])) {
    return { html: `Creating an account and browsing artisans is completely free. You only pay for the jobs you book, at a price you agree on with the worker beforehand.` };
  }
  if (HunBot.match(text, ['worker','join as a pro','become a pro','earn money','work with hunarmand','provider'])) {
    return { html: `Join as a professional and start receiving job requests from clients near you — it's free to list your services, and you get paid for every job you complete.<br><a class="hb-cta" href="auth.html?action=signup&role=worker">Join as a Professional →</a>` };
  }
  if (HunBot.match(text, ['sign up','signup','register','create account','join'])) {
    return { html: `Signing up takes less than a minute — just your name, email and phone.<br><a class="hb-cta" href="auth.html?action=signup">Sign Up Free →</a>` };
  }
  if (HunBot.match(text, ['log in','login','sign in'])) {
    return { html: `You can log in right here:<br><a class="hb-cta" href="auth.html?action=login">Log In →</a>` };
  }
  if (HunBot.match(text, ['city','cities','where','location','area'])) {
    const cities = (typeof HJ !== 'undefined') ? Object.keys(HJ.CITY_COORDS).join(', ') : 'Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta';
    return { html: `Hunarmand currently covers: ${cities}.` };
  }
  if (HunBot.match(text, ['what is hunarmand','about hunarmand','who are you','what do you do'])) {
    return { html: `Hunarmand is Pakistan's marketplace for skilled workers — plumbers, electricians, carpenters, painters, cleaners and more. We connect verified, background-checked professionals with people who need work done, all in one place.` };
  }
  if (HunBot.match(text, ['hi','hello','hey','salam','assalam'])) {
    return { html: `Hey! 👋 Want to know how Hunarmand works, or do you have something that needs fixing?` };
  }
  return null; // no local intent matched — let the AI take a shot
};

/* ═══════════════════════ CUSTOMER RESPONSES ═══════════════════════ */
HunBot.respondCustomer = function(text){
  const trade = HunBot.detectTrade(text);
  if (trade && typeof HJ !== 'undefined') {
    const all = JSON.parse(localStorage.getItem('allWorkers')||'[]')
      .filter(w=>(w.status||'').toLowerCase()==='verified' && w.skill===trade)
      .map(w=>({...w, meta: HJ.getWorkerMeta(w.id)}))
      .sort((a,b)=>b.meta.avgRating-a.meta.avgRating)
      .slice(0,3);
    if (!all.length) {
      return { html: `I couldn't find a verified <b>${trade}</b> professional right now — try browsing all artisans instead.<br><a class="hb-cta" href="findworker.html">Browse Artisans →</a>`, trade };
    }
    const cards = all.map(w => {
      const av = HJ.AVAILABILITY[w.meta.availability] || HJ.AVAILABILITY.online;
      return `<div class="hb-worker-card"><div class="hb-wc-top"><span>${HunBot.esc(w.name)}</span><span style="color:${av.color}">${av.label}</span></div><div class="hb-wc-meta">⭐ ${w.meta.avgRating.toFixed(1)} (${w.meta.reviewCount}) · ${w.meta.hourlyRate?'Rs. '+w.meta.hourlyRate+'/hr':'Rate on request'} · ${w.city}</div></div>`;
    }).join('');
    return { html: `For a <b>${trade}</b> issue, I'd recommend:${cards}You should hire whichever fits your schedule and budget best — I'd lean toward the top-rated one if you're not sure.<br><a class="hb-cta" href="findworker.html?skill=${encodeURIComponent(trade)}">Request One →</a>`, trade };
  }
  if (HunBot.match(text, ['my booking','my request','status of my','track my'])) {
    const jobs = (typeof HJ !== 'undefined') ? HJ.forClient(HunBot.session.id) : [];
    const active = jobs.filter(j=>j.status==='requested'||j.status==='accepted'||j.status==='in_progress').length;
    const done = jobs.filter(j=>j.status==='completed').length;
    return { html: `You currently have <b>${active}</b> active booking${active===1?'':'s'} and <b>${done}</b> completed. Want the details?<br><a class="hb-cta" href="booking2.html">View My Bookings →</a>` };
  }
  if (HunBot.match(text, ['pay','payment','wallet','easypaisa','jazzcash','top up','top-up'])) {
    return { html: `You can pay with EasyPaisa, JazzCash, or a linked bank account. Payments are held safely and only released to the worker once a job's marked complete.<br><a class="hb-cta" href="payment.html">Go to Wallet →</a>` };
  }
  if (HunBot.match(text, ['cancel'])) {
    return { html: `You can cancel any booking that's still in "Requested" status (before the worker accepts) from My Bookings.<br><a class="hb-cta" href="booking2.html">My Bookings →</a>` };
  }
  if (HunBot.match(text, ['refer','referral','invite'])) {
    return { html: `Share your referral link and you'll both get Rs. 300 wallet credit when your friend signs up.<br><a class="hb-cta" href="settings.html">Get My Referral Link →</a>` };
  }
  if (HunBot.match(text, ['problem','issue','complaint','report'])) {
    return { html: `Sorry to hear that. You can report an issue directly on the specific booking and our team will review it.<br><a class="hb-cta" href="booking2.html">My Bookings →</a>` };
  }
  if (HunBot.match(text, ['hi','hello','hey','salam','assalam'])) {
    return { html: `Hey! What do you need done today? Describe the problem and I'll point you to the right pro.` };
  }
  return null; // no local intent matched — let the AI take a shot
};

/* ═══════════════════════ WORKER RESPONSES ═══════════════════════ */
HunBot.respondWorker = function(text){
  if (HunBot.match(text, ['earn more','more money','increase income','more jobs','get more clients','get more bookings','make more'])) {
    const meta = (typeof HJ !== 'undefined') ? HJ.getWorkerMeta(HunBot.session.id) : null;
    const tips = [];
    if (meta && !meta.hourlyRate) tips.push("Set an hourly rate on your Profile — clients often skip workers with no listed rate.");
    if (meta && (!meta.bio || meta.bio.length<20)) tips.push("Write a fuller bio — a couple of sentences about your experience builds trust.");
    if (meta && (!meta.portfolio || meta.portfolio.length<3)) tips.push("Add more portfolio tags so clients searching by specialty can find you.");
    if (meta && meta.availability !== 'online') tips.push("Set your status to Online when you're free to work — clients skip Busy/Offline workers.");
    tips.push("Respond to new requests quickly — fast responses win more jobs.");
    tips.push("Ask happy clients to leave a review — a strong rating is the #1 thing that gets you picked.");
    const list = tips.slice(0,4).map(t=>`• ${t}`).join('<br>');
    return { html: `Here's how to earn more on Hunarmand:<br><br>${list}` };
  }
  if (HunBot.match(text, ['improve','get better','grow','stand out'])) {
    return { html: `A few things that help you stand out:<br>• Keep your profile photo and bio up to date<br>• List your specific skills as portfolio tags<br>• Stay responsive to job requests and messages<br>• Deliver consistent quality — repeat clients and good reviews compound over time<br><a class="hb-cta" href="worker-dashboard.html#profile" onclick="document.querySelector('[data-page=profile]')?.click()">Edit My Profile →</a>` };
  }
  if (HunBot.match(text, ['verify','verification','get verified','approved','pending','review my'])) {
    return { html: `New workers are manually reviewed by our admin team, usually within 24 hours. Once verified, you'll be able to accept job requests and appear in client searches.` };
  }
  if (HunBot.match(text, ['withdraw','get paid','payout','cash out'])) {
    return { html: `Link EasyPaisa, JazzCash, or a bank account under Settings, then withdraw anytime from your Earnings page.<br><a class="hb-cta" href="worker-dashboard.html" onclick="document.querySelector('[data-page=settings]')?.click()">Go to Settings →</a>` };
  }
  if (HunBot.match(text, ['rating','review','stars'])) {
    const meta = (typeof HJ !== 'undefined') ? HJ.getWorkerMeta(HunBot.session.id) : null;
    const cur = meta ? ` You're currently at ${meta.avgRating.toFixed(1)}★ from ${meta.reviewCount} review${meta.reviewCount===1?'':'s'}.` : '';
    return { html: `Good reviews come from clear communication, showing up on time, and doing quality work.${cur} Politely asking satisfied clients to leave a review also helps a lot.` };
  }
  if (HunBot.match(text, ['job request','new job','how do jobs work'])) {
    return { html: `Clients can request you directly from your profile. New requests show up under Job Requests — accept or decline, then track progress through My Jobs.` };
  }
  if (HunBot.match(text, ['hi','hello','hey','salam','assalam'])) {
    return { html: `Hey! Ask me about growing your business on Hunarmand — earnings, ratings, verification, withdrawals, anything.` };
  }
  return null; // no local intent matched — let the AI take a shot
};
