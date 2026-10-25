/**
 * public/js/translation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Feature 2: Multilingual support
 * Manages the language selection UI + calls translation API
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Translation = (() => {
  // ── Supported languages ────────────────────────────────────────────────────
  const LANGUAGES = {
    en: { name: 'English',  nativeName: 'English', flag: '🇬🇧', voiceLang: 'en-IN' },
    hi: { name: 'Hindi',    nativeName: 'हिंदी',   flag: '🇮🇳', voiceLang: 'hi-IN' },
    mr: { name: 'Marathi',  nativeName: 'मराठी',   flag: '🇮🇳', voiceLang: 'mr-IN' },
  };

  // ── State ──────────────────────────────────────────────────────────────────
  let currentLang = localStorage.getItem('git_chatbot_lang') || 'en';
  let onChangeCb  = null;

  // ── UI text per language ───────────────────────────────────────────────────
  const UI_TEXT = {
    en: {
      placeholder: 'Type your question here…',
      sendTitle:   'Send message',
      micTitle:    'Voice input',
      liveChatBtn: '💬 Chat with Admin',
      typingText:  'GIT Assistant is typing…',
      youLabel:    'You',
    },
    hi: {
      placeholder: 'अपना प्रश्न यहाँ लिखें…',
      sendTitle:   'संदेश भेजें',
      micTitle:    'आवाज़ इनपुट',
      liveChatBtn: '💬 एडमिन से बात करें',
      typingText:  'GIT सहायक लिख रहा है…',
      youLabel:    'आप',
    },
    mr: {
      placeholder: 'आपला प्रश्न येथे लिहा…',
      sendTitle:   'संदेश पाठवा',
      micTitle:    'आवाज इनपुट',
      liveChatBtn: '💬 अ‍ॅडमिनशी बोला',
      typingText:  'GIT सहाय्यक लिहित आहे…',
      youLabel:    'तुम्ही',
    },
  };

  // ── Get current language ───────────────────────────────────────────────────
  function getLang()       { return currentLang; }
  function getLangInfo()   { return LANGUAGES[currentLang]; }
  function getAllLanguages(){ return LANGUAGES; }

  // ── Set language ───────────────────────────────────────────────────────────
  function setLang(langCode) {
    if (!LANGUAGES[langCode]) {
      console.warn(`[Translation] Unsupported language: ${langCode}`);
      return;
    }
    currentLang = langCode;
    localStorage.setItem('git_chatbot_lang', langCode);
    _updateUI();
    if (onChangeCb) onChangeCb(langCode, LANGUAGES[langCode]);
    console.log(`[Translation] Language set to: ${LANGUAGES[langCode].name}`);
  }

  // ── Translate via backend API ──────────────────────────────────────────────
  async function translateText(text, targetLang, sourceLang = 'auto') {
    if (!text || targetLang === 'en' && sourceLang === 'en') return text;
    if (targetLang === sourceLang) return text;

    try {
      const res  = await fetch('/api/translate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, targetLang, sourceLang }),
      });
      const data = await res.json();
      return data.success ? data.translated : text;
    } catch (err) {
      console.warn('[Translation] API call failed:', err.message);
      return text;
    }
  }

  // ── Auto-detect language ───────────────────────────────────────────────────
  async function detectLanguage(text) {
    if (!text || text.length < 3) return 'en';
    try {
      const res  = await fetch('/api/translate/detect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      return data.success ? data.lang : 'en';
    } catch {
      return 'en';
    }
  }

  // ── Get UI text for current language ──────────────────────────────────────
  function getUIText() {
    return UI_TEXT[currentLang] || UI_TEXT.en;
  }

  // ── Update UI elements ─────────────────────────────────────────────────────
  function _updateUI() {
    const text = getUIText();
    const inputEl = document.getElementById('chat-input');
    if (inputEl) inputEl.placeholder = text.placeholder;

    const sendEl = document.getElementById('send-btn');
    if (sendEl) sendEl.title = text.sendTitle;

    const micEl = document.getElementById('mic-btn');
    if (micEl) micEl.title = text.micTitle;

    // Update language selector visual
    const selector = document.getElementById('lang-selector');
    if (selector) {
      const info = LANGUAGES[currentLang];
      selector.value = currentLang;
      const flagEl = document.getElementById('lang-flag');
      if (flagEl) flagEl.textContent = info.flag;
    }
  }

  // ── Register change callback ───────────────────────────────────────────────
  function onChange(cb) { onChangeCb = cb; }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    _updateUI();
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    getLang,
    getLangInfo,
    getAllLanguages,
    setLang,
    translateText,
    detectLanguage,
    getUIText,
    onChange,
    init,
  };
})();
