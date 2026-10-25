/**
 * services/translationService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multilingual Translation Service
 * Supports: English (en), Hindi (hi), Marathi (mr)
 *
 * Strategy:
 *  1. If GOOGLE_TRANSLATE_API_KEY is set → use Google Cloud Translate v2 (paid)
 *  2. Otherwise → use the free Google Translate unofficial endpoint via HTTP
 *     (suitable for low-to-medium traffic; no API key needed)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');

// ── Language config ──────────────────────────────────────────────────────────
const SUPPORTED_LANGUAGES = {
  en: { name: 'English',  nativeName: 'English', flag: '🇬🇧' },
  hi: { name: 'Hindi',    nativeName: 'हिंदी',   flag: '🇮🇳' },
  mr: { name: 'Marathi',  nativeName: 'मराठी',   flag: '🇮🇳' },
};

const DEFAULT_LANG = 'en';

// Cache: avoid re-translating identical strings
const translationCache = new Map();
const CACHE_MAX = 500;

// ── Core translation function ────────────────────────────────────────────────
/**
 * Translate text between languages.
 * @param {string} text        - Text to translate
 * @param {string} targetLang  - Target language code ('en', 'hi', 'mr')
 * @param {string} sourceLang  - Source language code (default 'auto')
 * @returns {Promise<string>}  - Translated text
 */
async function translate(text, targetLang, sourceLang = 'auto') {
  if (!text || !text.trim()) return text;
  if (targetLang === DEFAULT_LANG && sourceLang === DEFAULT_LANG) return text;
  if (targetLang === sourceLang) return text;

  const cacheKey = `${sourceLang}→${targetLang}:${text.substring(0, 80)}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  let translated;

  try {
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      translated = await translateViaOfficialAPI(text, targetLang, sourceLang);
    } else {
      translated = await translateViaFreeEndpoint(text, targetLang, sourceLang);
    }
  } catch (err) {
    console.warn(`[TranslationService] Translation failed: ${err.message} — returning original text`);
    translated = text;
  }

  // Store in cache
  if (translationCache.size >= CACHE_MAX) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }
  translationCache.set(cacheKey, translated);

  return translated;
}

// ── Official Google Cloud Translate v2 ───────────────────────────────────────
async function translateViaOfficialAPI(text, targetLang, sourceLang) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const url    = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const response = await axios.post(url, {
    q:      text,
    target: targetLang,
    source: sourceLang === 'auto' ? undefined : sourceLang,
    format: 'text',
  }, { timeout: 8000 });

  return response.data.data.translations[0].translatedText;
}

// ── Free Google Translate (unofficial) ───────────────────────────────────────
async function translateViaFreeEndpoint(text, targetLang, sourceLang) {
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang;

  // Split long text into chunks ≤ 500 chars to avoid 400 errors
  const chunks     = chunkText(text, 480);
  const translated = [];

  for (const chunk of chunks) {
    const url = `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=${sl}&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;

    const response = await axios.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const data   = response.data;
    const result = data[0].map(item => (item[0] || '')).join('');
    translated.push(result);
  }

  return translated.join(' ');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function chunkText(text, maxLen) {
  const sentences = text.split(/(?<=[.!?।\n])\s+/);
  const chunks    = [];
  let current     = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

// ── Translate question to English (for NLP processing) ───────────────────────
async function translateToEnglish(text, sourceLang) {
  if (sourceLang === 'en' || !sourceLang || sourceLang === 'auto') return text;
  return translate(text, 'en', sourceLang);
}

// ── Translate English bot response to user's language ────────────────────────
async function translateFromEnglish(text, targetLang) {
  if (!targetLang || targetLang === 'en') return text;
  return translate(text, targetLang, 'en');
}

// ── Detect language (basic heuristic + optional API) ─────────────────────────
async function detectLanguage(text) {
  if (!text || text.length < 3) return 'en';

  // Unicode range checks (fast, no API needed)
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars      = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'en';

  const devanagariRatio = devanagariCount / totalChars;

  if (devanagariRatio > 0.3) {
    // Both Hindi and Marathi use Devanagari
    // Marathi-specific words/suffixes for basic differentiation
    const marathiWords = ['आहे','आहेत','कसे','काय','मला','तुम्ही','आपले','कोठे','केव्हा'];
    const hasMarathi   = marathiWords.some(w => text.includes(w));
    return hasMarathi ? 'mr' : 'hi';
  }

  return 'en';
}

// ── Cache stats ──────────────────────────────────────────────────────────────
function getCacheStats() {
  return { size: translationCache.size, max: CACHE_MAX };
}

function clearCache() {
  translationCache.clear();
}

module.exports = {
  translate,
  translateToEnglish,
  translateFromEnglish,
  detectLanguage,
  getSupportedLanguages: () => SUPPORTED_LANGUAGES,
  getCacheStats,
  clearCache,
};