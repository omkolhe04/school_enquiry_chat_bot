/**
 * public/chat.js — v3.0 (BROWSER-DIRECT translation)
 * ─────────────────────────────────────────────────────────────────────────────
 * v3.0 FIX:
 *   Root cause: server cannot reach translate.googleapis.com (network blocked).
 *   clientTranslate() was calling /api/translate → server → BLOCKED → returns
 *   original Hindi/Marathi → NLP fallback every time.
 *
 *   Fix: call translate.googleapis.com DIRECTLY FROM THE BROWSER (not via
 *   server). Browsers are not subject to the same network restrictions.
 *   Falls back to offline keyword dictionary if browser fetch also fails.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Session ID ─────────────────────────────────────── */
const SESSION_ID = (() => {
  let id = sessionStorage.getItem('git_session_id');
  if (!id) {
    id = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('git_session_id', id);
  }
  return id;
})();

/* ── DOM refs ───────────────────────────────────────── */
const messagesEl  = document.getElementById('chat-messages');
const inputEl     = document.getElementById('chat-input');
const sendBtn     = document.getElementById('send-btn');
const clearBtn    = document.getElementById('btn-clear');
const chipsEl     = document.getElementById('quick-chips');
const micBtn      = document.getElementById('mic-btn');
const langSel     = document.getElementById('lang-selector');
const voiceStatus = document.getElementById('voice-status');

/* ══════════════════════════════════════════════════════
   OFFLINE KEYWORD DICTIONARY
   Used when all network translation fails.
   Maps Hindi/Marathi → English for common school enquiry queries.
══════════════════════════════════════════════════════ */
const KEYWORD_DICT = {
  /* ── Greetings ── */
  'नमस्कार':'hello', 'नमस्ते':'hello', 'हेलो':'hello', 'हाय':'hi',
  'सुप्रभात':'good morning', 'शुभ प्रभात':'good morning',
  'शुभ संध्या':'good evening', 'अलविदा':'goodbye', 'धन्यवाद':'thank you',
  'शुक्रिया':'thank you', 'कृपया':'please', 'माफ़ करें':'sorry',
  'नमस्कार':'hello',  // Marathi greeting same

  /* ── Admissions ── */
  'प्रवेश':'admission', 'दाखिला':'admission', 'एडमिशन':'admission',
  'आवेदन':'application', 'फार्म':'form', 'ऑनलाइन आवेदन':'online application',
  'पात्रता':'eligibility', 'दस्तावेज':'documents', 'मेरिट लिस्ट':'merit list',
  'काउंसलिंग':'counseling', 'सीट':'seat', 'रजिस्ट्रेशन':'registration',
  'अर्ज':'application form', 'प्रवेश प्रक्रिया':'admission process',

  /* ── Fees ── */
  'फीस':'fees', 'फीज':'fees', 'शुल्क':'fees', 'फ़ीस':'fees',
  'ट्यूशन फीस':'tuition fees', 'बस फीस':'bus fees', 'बस शुल्क':'bus fees',
  'कितनी फीस':'how much fees', 'फीस कितनी है':'what is the fees',
  'शुल्क माहिती':'fees information', 'हप्ता':'instalment', 'किस्त':'instalment',
  'सवलत':'concession', 'छूट':'concession',

  /* ── School / Classes ── */
  'स्कूल':'school', 'शाळा':'school', 'विद्यालय':'school',
  'कक्षा':'class', 'इयत्ता':'class', 'वर्ग':'class', 'क्लास':'class',
  'नर्सरी':'nursery', 'बालवाडी':'nursery', 'केजी':'kg',
  'उम्र':'age', 'वय':'age', 'आयु':'age',
  'बोर्ड':'board', 'सीबीएसई':'cbse', 'माध्यम':'medium',
  'शिक्षक':'teacher', 'शिक्षिका':'teacher', 'अध्यापक':'teacher',
  'मुख्याध्यापक':'principal', 'प्रिंसिपल':'principal', 'प्रधानाचार्य':'principal',
  'विषय':'subjects', 'पाठ्यक्रम':'curriculum', 'अभ्यासक्रम':'curriculum',
  'गृहपाठ':'homework', 'होमवर्क':'homework',
  'किताबें':'books', 'पुस्तके':'books', 'पुस्तकें':'books',
  'गणवेश':'uniform', 'वर्दी':'uniform', 'यूनिफॉर्म':'uniform',
  'डबा':'tiffin', 'टिफिन':'tiffin', 'खाना':'food', 'जेवण':'food',
  'सुट्टी':'holiday', 'छुट्टी':'holiday', 'छुट्टियां':'holidays',
  'वेळ':'timing', 'शाळेची वेळ':'school timings', 'स्कूल का समय':'school timings',
  'दाखला':'transfer certificate', 'टीसी':'transfer certificate',

  /* ── Transport ── */
  'परिवहन':'transport', 'बस':'bus', 'बस सुविधा':'bus facility',
  'स्कूल बस':'school bus', 'वाहतूक':'transport', 'वैन':'van',

  /* ── Exams ── */
  'परीक्षा':'exam', 'इम्तिहान':'exam', 'एग्जाम':'exam',
  'परिणाम':'result', 'रिजल्ट':'result', 'निकाल':'result', 'मार्कशीट':'report card',
  'टाइम टेबल':'timetable', 'वेळापत्रक':'timetable',

  /* ── Facilities / Activities ── */
  'लाइब्रेरी':'library', 'पुस्तकालय':'library', 'ग्रंथालय':'library',
  'कैंटीन':'canteen', 'कॅन्टीन':'canteen',
  'खेल':'sports', 'स्पोर्ट्स':'sports', 'क्रीडा':'sports', 'मैदान':'playground',
  'लैब':'lab', 'प्रयोगशाला':'lab', 'सुविधा':'facilities',
  'सुरक्षा':'safety', 'उपक्रम':'activities', 'गतिविधियां':'activities',
  'कार्यक्रम':'events', 'स्नेहसंमेलन':'annual day', 'वार्षिकोत्सव':'annual day',

  /* ── Scholarship ── */
  'छात्रवृत्ति':'scholarship', 'शिष्यवृत्ती':'scholarship', 'स्कॉलरशिप':'scholarship',

  /* ── Contact / Address ── */
  'संपर्क':'contact', 'फ़ोन':'phone contact', 'नंबर':'contact number',
  'पता':'address', 'ईमेल':'email contact', 'वेबसाइट':'website',
  'समय':'timing hours', 'ऑफिस समय':'office hours',
  'माहिती':'information', 'जानकारी':'information',

  /* ── Question words Hindi ── */
  'क्या है':'what is', 'कैसे':'how to', 'कब':'when',
  'कहाँ':'where', 'कितना':'how much', 'कितनी':'how much',
  'बताओ':'tell me about', 'कौन सा':'which', 'क्या':'what',

  /* ── Question words Marathi ── */
  'काय आहे':'what is', 'कसे':'how', 'कधी':'when',
  'कुठे':'where', 'किती':'how much', 'सांगा':'tell me',
  'कोणता':'which', 'काय':'what',
};

/**
 * Offline keyword translation — replaces known Hindi/Marathi words with English.
 * Not grammatically perfect but sufficient for NLP intent matching.
 */
function keywordFallback(text) {
  let result = text;
  const keys = Object.keys(KEYWORD_DICT).sort((a,b) => b.length - a.length);
  for (const k of keys) {
    result = result.replace(new RegExp(k, 'g'), ' ' + KEYWORD_DICT[k] + ' ');
  }
  return result.replace(/\s+/g,' ').trim() || text;
}

/* ══════════════════════════════════════════════════════
   BROWSER-DIRECT TRANSLATION  ← v3.0 KEY FIX
   Calls Google Translate API directly from the BROWSER.
   Browsers are NOT subject to server-side network blocks.
   Three attempts, then falls back to keyword dictionary.
══════════════════════════════════════════════════════ */
const _xlateCache = new Map();

async function xlate(text, targetLang, srcLang = 'auto') {
  if (!text || !text.trim()) return text;
  if (targetLang === srcLang) return text;
  if (targetLang === 'en' && !/[\u0900-\u097F\u0980-\u09FF]/.test(text)) return text; // already Latin

  const key = `${srcLang}→${targetLang}:${text}`;
  if (_xlateCache.has(key)) return _xlateCache.get(key);

  let result = null;

  // ── Attempt 1: Google Translate (browser fetch, no server) ──────────────
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=${srcLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    result = data[0].map(item => item[0] || '').join('').trim();
    if (result && result !== text) {
      _xlateCache.set(key, result);
      console.log(`[xlate] Google: "${text}" → "${result}"`);
      return result;
    }
  } catch(e) {
    console.warn('[xlate] Google attempt failed:', e.message);
  }

  // ── Attempt 2: MyMemory free API (no key needed) ─────────────────────────
  try {
    const pair = srcLang === 'auto' ? `hi|${targetLang}` : `${srcLang}|${targetLang}`;
    const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
    const res2  = await fetch(url2, { signal: AbortSignal.timeout(5000) });
    const data2 = await res2.json();
    result = data2?.responseData?.translatedText?.trim();
    if (result && result !== text && !result.includes('MYMEMORY WARNING')) {
      _xlateCache.set(key, result);
      console.log(`[xlate] MyMemory: "${text}" → "${result}"`);
      return result;
    }
  } catch(e) {
    console.warn('[xlate] MyMemory attempt failed:', e.message);
  }

  // ── Attempt 3: Server proxy /api/translate ───────────────────────────────
  try {
    const res3 = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang: srcLang }),
      signal: AbortSignal.timeout(6000),
    });
    const data3 = await res3.json();
    result = data3?.translated?.trim();
    if (result && result !== text) {
      _xlateCache.set(key, result);
      console.log(`[xlate] Server proxy: "${text}" → "${result}"`);
      return result;
    }
  } catch(e) {
    console.warn('[xlate] Server proxy failed:', e.message);
  }

  // ── Fallback: keyword dictionary ─────────────────────────────────────────
  if (targetLang === 'en') {
    const kw = keywordFallback(text);
    if (kw !== text) {
      _xlateCache.set(key, kw);
      console.log(`[xlate] Keyword fallback: "${text}" → "${kw}"`);
      return kw;
    }
  }

  console.warn(`[xlate] All methods failed for: "${text}"`);
  return text;
}

/* ── Translate user text → English for NLP ──────────── */
async function toEnglish(text, lang) {
  if (lang === 'en') return text;
  return xlate(text, 'en', lang);
}

/* ── Translate English bot response → user language ─── */
async function fromEnglish(text, lang) {
  if (lang === 'en') return text;
  return xlate(text, lang, 'en');
}

/* ══════════════════════════════════════════════════════
   SOCKET.IO
══════════════════════════════════════════════════════ */
let socket;
try {
  socket = io({ transports: ['websocket', 'polling'] });
  socket.on('connect',    () => console.log('✅ Socket:', socket.id));
  socket.on('disconnect', () => console.log('⚠️ Socket disconnected'));
  socket.on('bot_typing', (v) => v ? showTyping() : hideTyping());
  socket.on('connect_error', () => console.warn('Socket error — REST fallback'));
  socket.on('bot_response', async (d) => {
    hideTyping();
    const lang = curLang();
    // Server sends response in English if server-side translation failed.
    // Re-translate on client if needed.
    let responseText = d.message;
    if (lang !== 'en') {
      const isDevanagari = /[\u0900-\u097F]/.test(d.message);
      if (!isDevanagari) {
        // Response came back in English — translate it
        responseText = await fromEnglish(d.message, lang);
      }
    }
    renderBotMsg(responseText, d.intent, d.confidence, d.isFallback);
    if (d.canEscalate && typeof LiveChatUI !== 'undefined') {
      LiveChatUI.showTrigger(responseText, d.confidence);
    }
  });
} catch(e) { socket = null; }

/* ── Helper: get current language ── */
function curLang() {
  return typeof Translation !== 'undefined' ? Translation.getLang() : 'en';
}

/* ══════════════════════════════════════════════════════
   FEATURE 1: VOICE CHAT INIT
══════════════════════════════════════════════════════ */
if (typeof VoiceChat !== 'undefined') {
  if (!VoiceChat.isSupported()) {
    if (micBtn) {
      micBtn.disabled = true;
      micBtn.title    = 'Voice input requires Chrome or Edge browser';
      micBtn.style.opacity = '0.38';
    }
  } else {
    VoiceChat.onTranscript((text, isFinal) => {
      if (inputEl) inputEl.value = text;
      if (isFinal && text.trim()) setTimeout(() => sendMessage(), 300);
    });
    VoiceChat.onStatusChange(updateVoiceStatus);
  }
}

/* ══════════════════════════════════════════════════════
   FEATURE 2: TRANSLATION INIT
══════════════════════════════════════════════════════ */
if (typeof Translation !== 'undefined') {
  Translation.init();
  Translation.onChange((langCode, langInfo) => {
    if (typeof VoiceChat !== 'undefined' && VoiceChat.isSupported()) {
      VoiceChat.init({ lang: langInfo.voiceLang });
    }
    renderSystemMsg(`🌐 Language changed to: ${langInfo.flag} ${langInfo.nativeName}`);
  });
}

/* ══════════════════════════════════════════════════════
   FEATURE 3: LIVE CHAT INIT
══════════════════════════════════════════════════════ */
if (typeof LiveChatUI !== 'undefined' && socket) {
  LiveChatUI.init(socket, SESSION_ID);
}

/* ══════════════════════════════════════════════════════
   CORE SEND FUNCTION
══════════════════════════════════════════════════════ */
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  setSendDisabled(true);
  renderUserMsg(text);   // show user's original text in bubble
  hideChips();

  const lang = curLang();

  // ── Step 1: Translate TO English for NLP ─────────────────────────────────
  let nlpText = text;
  if (lang !== 'en') {
    const showXlating = setTimeout(() => {
      showTyping(); // show typing while translating
    }, 300);
    nlpText = await toEnglish(text, lang);
    clearTimeout(showXlating);
    console.log(`[send] NLP text: "${nlpText}"`);
  }

  // ── Step 2: Send to bot ───────────────────────────────────────────────────
  if (socket?.connected) {
    showTyping();
    socket.emit('chat_message', {
      message:      nlpText,    // English for NLP
      sessionId:    SESSION_ID,
      language:     lang,       // server will try to translate response back
      originalText: text,
    });
    // socket 'bot_response' handler does Step 3 (translate response back)
  } else {
    // REST fallback
    showTyping();
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: nlpText, sessionId: SESSION_ID, language: lang }),
      });
      const data = await res.json();
      hideTyping();
      if (data.success) {
        // ── Step 3: Translate response back to user's language ────────────────
        let responseText = data.message;
        if (lang !== 'en') {
          const isDevanagari = /[\u0900-\u097F]/.test(data.message);
          if (!isDevanagari) {
            responseText = await fromEnglish(data.message, lang);
          }
        }
        renderBotMsg(responseText, data.intent, data.confidence, data.isFallback);
        if (data.canEscalate && typeof LiveChatUI !== 'undefined') {
          LiveChatUI.showTrigger(responseText, data.confidence);
        }
      } else {
        renderBotMsg('Sorry, something went wrong. Please try again! 🙏', 'error', 0, true);
      }
    } catch {
      hideTyping();
      renderBotMsg('Network error. Please check your connection. 📡', 'error', 0, true);
    }
  }

  setSendDisabled(false);
  inputEl.focus();
}

/* ══════════════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════════════ */
sendBtn?.addEventListener('click', sendMessage);

inputEl?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

clearBtn?.addEventListener('click', () => {
  if (confirm('Clear chat history?')) {
    messagesEl.innerHTML = '';
    showWelcomeMsg();
    showChips();
  }
});

// Mic button
micBtn?.addEventListener('click', () => {
  if (typeof VoiceChat === 'undefined' || !VoiceChat.isSupported()) {
    updateVoiceStatus('error', '🎤 Voice input requires Chrome or Edge.');
    setTimeout(() => updateVoiceStatus('idle', ''), 3000);
    return;
  }
  const lang    = curLang();
  const langMap = { en:'en-IN', hi:'hi-IN', mr:'mr-IN' };
  if (VoiceChat.listening) {
    VoiceChat.stop();
    micBtn.classList.remove('recording');
  } else {
    const started = VoiceChat.start(langMap[lang] || 'en-IN');
    if (started) micBtn.classList.add('recording');
    else {
      updateVoiceStatus('error', '❌ Cannot start voice. Allow microphone access.');
      setTimeout(() => updateVoiceStatus('idle',''), 4000);
    }
  }
});

// Language selector
langSel?.addEventListener('change', e => {
  if (typeof Translation !== 'undefined') Translation.setLang(e.target.value);
});

// Quick chips
chipsEl?.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const query = chip.dataset.query || chip.textContent.replace(/[^\w\s]/g,'').trim();
  if (!query) return;
  inputEl.value = query;
  sendMessage();
});

/* ══════════════════════════════════════════════════════
   RENDER HELPERS
══════════════════════════════════════════════════════ */
function renderUserMsg(text) {
  const langLabel = typeof Translation !== 'undefined' && curLang() !== 'en'
    ? `<span class="msg-lang-badge">${Translation.getLangInfo().flag}</span>` : '';
  appendMsg(`
    <div class="msg user">
      <div class="msg-avatar">🧑</div>
      <div class="msg-body">
        <div class="msg-bubble">${escapeHtml(text)}${langLabel}</div>
        <div class="msg-meta"><span>${formatTime(new Date())}</span></div>
      </div>
    </div>`);
}

function renderBotMsg(text, intent='', confidence=0, isFallback=false) {
  const rendered  = renderMarkdown(text);
  const confClass = confidence >= 0.7 ? 'high' : confidence >= 0.4 ? 'medium' : 'low';
  const confPct   = Math.round(confidence * 100);
  const confBadge = confidence > 0 ? `<span class="conf-badge ${confClass}"
        data-conf="${confPct}" data-intent="${(intent||'').replace(/_/g,' ')}">
      ${confidence >= 0.7 ? '✓' : confidence >= 0.4 ? '~' : '?'} ${confPct}%
    </span>` : '';
  appendMsg(`
    <div class="msg bot${isFallback ? ' fallback' : ''}">
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">${rendered}</div>
        <div class="msg-meta">
          <span>${formatTime(new Date())}</span>
          ${confBadge}
          ${isFallback ? '<span class="fallback-tag">⚡ Live Help Available</span>' : ''}
        </div>
      </div>
    </div>`);
}

function renderSystemMsg(text) {
  appendMsg(`<div class="msg system-msg"><span>${escapeHtml(text)}</span></div>`);
}

function appendMsg(html) {
  messagesEl.insertAdjacentHTML('beforeend', html);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  messagesEl.querySelectorAll('.conf-badge:not([data-bound])').forEach(b => {
    b.dataset.bound = '1';
    b.addEventListener('click', () => alert(`Intent: ${b.dataset.intent||'unknown'}\nConfidence: ${b.dataset.conf}%`));
  });
}

/* ══════════════════════════════════════════════════════
   TYPING INDICATOR
══════════════════════════════════════════════════════ */
function showTyping() {
  if (document.getElementById('typing-indicator')) return;
  appendMsg(`<div class="msg bot" id="typing-indicator">
      <div class="msg-avatar">🤖</div>
      <div class="msg-body"><div class="msg-bubble typing-bubble">
        <span></span><span></span><span></span>
      </div></div></div>`);
}
function hideTyping() { document.getElementById('typing-indicator')?.remove(); }

/* ══════════════════════════════════════════════════════
   VOICE STATUS
══════════════════════════════════════════════════════ */
function updateVoiceStatus(state, message) {
  if (!voiceStatus) return;
  voiceStatus.textContent   = message;
  voiceStatus.className     = `voice-status ${state}`;
  voiceStatus.style.display = (state === 'idle' || !message) ? 'none' : 'block';
  if (state === 'listening') micBtn?.classList.add('recording');
  else micBtn?.classList.remove('recording');
  if (state === 'done' || state === 'idle')
    setTimeout(() => { if (voiceStatus) voiceStatus.style.display = 'none'; }, 2500);
}

/* ══════════════════════════════════════════════════════
   MARKDOWN RENDERER
══════════════════════════════════════════════════════ */
function renderMarkdown(raw) {
  if (!raw) return '';
  let html = escapeHtml(raw);
  html = html.replace(/(\|[^\n]+\|\n?)+/g, table => {
    const rows = table.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return table;
    const hdrs = rows[0].split('|').filter(c=>c.trim()).map(c=>`<th>${c.trim()}</th>`).join('');
    const isSep = r => /^[\s|:-]+$/.test(r);
    const body  = rows.slice(isSep(rows[1]) ? 2 : 1)
      .map(r => '<tr>' + r.split('|').filter(c=>c.trim()).map(c=>`<td>${c.trim()}</td>`).join('') + '</tr>')
      .join('');
    return `<div class="table-wrap"><table><thead><tr>${hdrs}</tr></thead><tbody>${body}</tbody></table></div>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^[•\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

/* ══════════════════════════════════════════════════════
   CHIPS & WELCOME
══════════════════════════════════════════════════════ */
function hideChips() { if (chipsEl) chipsEl.style.display = 'none'; }
function showChips() { if (chipsEl) chipsEl.style.display = 'flex'; }

function showWelcomeMsg() {
  const lang = curLang();
  const msgs = {
    en: '👋 Welcome to the **School Enquiry Assistant**!\n\nI support:\n• 🎙️ **Voice Input** — click the mic\n• 🌐 **Hindi & Marathi** — change language above\n• 💬 **Live Chat** — talk to our admissions team if needed\n\nAsk me about:\n📋 Admissions | 🎂 Age criteria | 💰 Fees | 🚌 Transport\n⏰ Timings | 👕 Uniform | 📝 Exams | 🏫 Facilities\n\nType your question! 😊',
    hi: '👋 **स्कूल प्रवेश सहायक** में आपका स्वागत है!\n\nमैं इनका समर्थन करता हूँ:\n• 🎙️ **वॉइस इनपुट** — माइक बटन दबाएं\n• 🌐 **हिंदी और मराठी** — ऊपर भाषा बदलें\n• 💬 **लाइव चैट** — प्रवेश टीम से बात करें\n\nपूछें:\n📋 प्रवेश | 🎂 आयु सीमा | 💰 फीस | 🚌 स्कूल बस\n⏰ स्कूल का समय | 👕 यूनिफॉर्म | 📝 परीक्षा\n\nअपना सवाल लिखें! 😊',
    mr: '👋 **शाळा प्रवेश सहाय्यक** मध्ये आपले स्वागत!\n\nमी सपोर्ट करतो:\n• 🎙️ **व्हॉइस इनपुट** — मायक बटण दाबा\n• 🌐 **मराठी आणि हिंदी** — वर भाषा बदला\n• 💬 **लाइव्ह चॅट** — प्रवेश टीमशी बोला\n\nविचारा:\n📋 प्रवेश | 🎂 वयोमर्यादा | 💰 शुल्क | 🚌 स्कूल बस\n⏰ शाळेची वेळ | 👕 गणवेश | 📝 परीक्षा\n\nप्रश्न विचारा! 😊',
  };
  setTimeout(() => renderBotMsg(msgs[lang] || msgs.en, 'greetings', 1.0, false), 400);
}

/* ══════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════ */
async function loadStats() {
  try {
    const res  = await fetch('/api/chat/stats').then(r => r.json());
    if (!res.success) return;
    const data = res.stats || {};
    const el = document.getElementById('stats-bar');
    if (el) el.innerHTML = `
      <span>🤖 ${data.totalSessions||0} sessions</span>
      <span>✅ ${data.accuracy||0}% accuracy</span>
      <span>💬 ${data.totalMessages||0} messages</span>`;
  } catch(_) {}
}

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function setSendDisabled(v) { if (sendBtn) sendBtn.disabled = v; }
function escapeHtml(s) {
  return (s||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatTime(d) { return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }

/* ── Init ────────────────────────────────────────────── */
showWelcomeMsg();
loadStats();
setInterval(loadStats, 30_000);