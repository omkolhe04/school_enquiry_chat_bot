/**
 * services/nlpService.js
 * Intent classifier for the school enquiry chatbot.
 * Scores each intent with keyword matching + stemmed Jaccard similarity.
 * Built-in intents come from data/schoolIntents.js; intents stored in
 * Supabase (editable from the Admin Panel) override built-ins of the same name.
 */

const natural = require('natural');
const Intent  = require('../models/Intent');
const tokenizer = new natural.WordTokenizer();
const stemmer   = natural.PorterStemmer;

const BUILT_IN_INTENTS = require('../data/schoolIntents');

// ══════════════════════════════════════════════════════════════
//  NLP ENGINE  — v5 Ultimate Edition
// ══════════════════════════════════════════════════════════════

function normalise(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  return tokens.map(t => stemmer.stem(t)).join(' ');
}

let intentCache  = [];
let cacheBuiltAt = null;
const CACHE_TTL  = 5 * 60 * 1000;

async function refreshCache() {
  try {
    const dbIntents = await Intent.findActive();
    if (dbIntents && dbIntents.length > 0) {
      const dbNames = new Set(dbIntents.map(i => i.intentName));
      const filtered = BUILT_IN_INTENTS.filter(i => !dbNames.has(i.intentName));
      intentCache = [...dbIntents, ...filtered];
      console.log(`NLP: ${dbIntents.length} DB + ${filtered.length} built-in = ${intentCache.length} intents`);
    } else {
      intentCache = BUILT_IN_INTENTS;
      console.log(`NLP: Using ${intentCache.length} built-in intents`);
    }
  } catch (err) {
    intentCache = BUILT_IN_INTENTS;
    console.warn(`NLP: DB error, falling back to built-in. ${err.message}`);
  }
  cacheBuiltAt = Date.now();
}

async function getIntents() {
  if (!cacheBuiltAt || Date.now() - cacheBuiltAt > CACHE_TTL) await refreshCache();
  return intentCache;
}

async function invalidateCache() { cacheBuiltAt = null; }

// ── Keyword score ─────────────────────────────────────────────
function scoreKeyword(queryLower, intent) {
  let best = 0;
  const keywords = (intent.keywords || []).map(k => k.toLowerCase());
  const phrases  = (intent.trainingPhrases || []).map(p => p.toLowerCase());
  const display  = (intent.displayName || intent.intentName || '').replace(/_/g,' ').toLowerCase();

  if (phrases.includes(queryLower) || keywords.includes(queryLower)) return 1.0;

  for (const kw of keywords) {
    if (kw === queryLower)                                    best = Math.max(best, 1.00);
    else if (kw.includes(queryLower))                        best = Math.max(best, 0.92);
    else if (queryLower.includes(kw) && kw.length >= 4)      best = Math.max(best, 0.88);
  }
  for (const ph of phrases) {
    if (ph === queryLower)                                    best = Math.max(best, 1.00);
    else if (ph.includes(queryLower))                        best = Math.max(best, 0.82);
    else if (queryLower.includes(ph) && ph.split(' ').length >= 2) best = Math.max(best, 0.78);
  }
  if (display.includes(queryLower) && queryLower.length >= 3) best = Math.max(best, 0.75);

  const qTokens = queryLower.split(/\s+/).filter(t => t.length >= 3);
  for (const tok of qTokens) {
    for (const kw of keywords) {
      if (kw === tok)                best = Math.max(best, 0.70);
      else if (kw.includes(tok))    best = Math.max(best, 0.65);
      else if (tok.includes(kw) && kw.length >= 4) best = Math.max(best, 0.62);
    }
    for (const ph of phrases) {
      if (ph.includes(tok))         best = Math.max(best, 0.58);
    }
    if (display.includes(tok))      best = Math.max(best, 0.60);
  }
  return best;
}

// ── Jaccard score ─────────────────────────────────────────────
function scoreJaccard(normQuery, intent) {
  const allText = [
    ...(intent.trainingPhrases || []),
    ...(intent.keywords || []),
    (intent.displayName || ''),
    (intent.intentName || '').replace(/_/g,' '),
  ].map(normalise).join(' ');

  const qSet = new Set(normQuery.split(' ').filter(Boolean));
  const iSet = new Set(allText.split(' ').filter(Boolean));
  if (!qSet.size || !iSet.size) return 0;
  const intersection = [...qSet].filter(t => iSet.has(t)).length;
  const union        = new Set([...qSet, ...iSet]).size;
  return intersection / union;
}

// ── Main classifier ───────────────────────────────────────────
async function classifyIntent(userMessage) {
  const THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.20;
  const intents   = await getIntents();
  if (!intents.length) return buildFallback(userMessage, []);

  const queryLower = userMessage.toLowerCase().trim();
  const normQuery  = normalise(userMessage);
  const wordCount  = queryLower.split(/\s+/).filter(Boolean).length;

  const scores = intents.map(intent => {
    const kw      = scoreKeyword(queryLower, intent);
    const jaccard = scoreJaccard(normQuery, intent);

    let w1, w2;
    if      (wordCount <= 2) { w1 = 0.84; w2 = 0.16; }
    else if (wordCount <= 5) { w1 = 0.58; w2 = 0.42; }
    else                     { w1 = 0.36; w2 = 0.64; }

    return {
      intent:      intent.intentName,
      displayName: intent.displayName || intent.intentName,
      score:       w1 * kw + w2 * jaccard,
      responses:   intent.responses || [],
      _id:         intent._id,
    };
  });

  scores.sort((a, b) => b.score - a.score);
  const best      = scores[0];
  const allScores = scores.slice(0, 10).map(({ intent, score }) => ({ intent, score: +score.toFixed(4) }));
  const entities  = extractEntities(userMessage);

  if (best.score >= THRESHOLD) {
    const resp = best.responses[Math.floor(Math.random() * best.responses.length)];
    if (best._id) Intent.incrementHit(best._id).catch(() => {});
    return {
      intent:      best.intent,
      displayName: best.displayName,
      confidence:  +best.score.toFixed(4),
      response:    personalise(resp),
      entities,
      isFallback:  false,
      allScores,
    };
  }
  return buildFallback(userMessage, allScores, entities);
}

// ── Helpers ───────────────────────────────────────────────────
const ENTITY_PATTERNS = [
  { name: 'year',   regex: /\b(20\d{2})\b/g },
  { name: 'class',  regex: /\b(?:class|grade|std\.?|standard)\s*(?:1[0-2]|[1-9])(?:st|nd|rd|th)?\b|\b(?:1[0-2]|[1-9])(?:st|nd|rd|th)\s*(?:class|grade|std|standard)?\b/gi },
  { name: 'level',  regex: /\b(playgroup|play group|nursery|lkg|ukg|jr\.?\s*kg|sr\.?\s*kg|pre[- ]?primary|kindergarten)\b/gi },
  { name: 'stream', regex: /\b(science|commerce|humanities|arts|pcm|pcb)\b/gi },
];

function extractEntities(text) {
  const found = [];
  ENTITY_PATTERNS.forEach(({ name, regex }) => {
    const matches = text.match(regex);
    if (matches) matches.forEach(m => found.push(`${name}:${m.trim()}`));
  });
  return found;
}

function personalise(tpl) {
  return tpl
    .replace(/{{SCHOOL_NAME}}/g, process.env.SCHOOL_NAME    || 'Greenfield Public School')
    .replace(/{{PHONE}}/g,       process.env.SCHOOL_PHONE   || '+91-20-0000-0000')
    .replace(/{{EMAIL}}/g,       process.env.SCHOOL_EMAIL   || 'admissions@greenfieldschool.edu.in')
    .replace(/{{WEBSITE}}/g,     process.env.SCHOOL_WEBSITE || 'https://www.greenfieldschool.edu.in')
    .replace(/{{ADDRESS}}/g,     process.env.SCHOOL_ADDRESS || 'School Road, Pune, Maharashtra 411001');
}

function buildFallback(userMessage, allScores, entities = []) {
  const suggestions = [
    '🤔 I didn\'t quite understand that. Here are some things you can ask:\n\n• *How do I apply for admission?*\n• *What is the age criteria for nursery?*\n• *What is the fee structure?*\n• *Is school bus available?*\n• *What are the school timings?*\n• *Which board is the school affiliated to?*\n• *What documents are required?*\n\nOr call us at **{{PHONE}}** 😊',
    '🤔 Hmm, could you rephrase that? Try asking about:\n• **Admission** | **Age criteria** | **Fees** | **Transport** | **Timings**\n• **Uniform** | **Exams** | **Facilities** | **Activities** | **Contact**',
  ];
  return {
    intent:      'fallback',
    displayName: 'Fallback',
    confidence:  allScores[0]?.score || 0,
    response:    personalise(suggestions[Math.floor(Math.random() * suggestions.length)]),
    entities,
    isFallback:  true,
    allScores,
  };
}

function computeAccuracy(logs) {
  const total   = logs.length;
  const correct = logs.filter(l => !l.isFallback).length;
  return total === 0 ? 0 : +((correct / total) * 100).toFixed(2);
}

module.exports = { classifyIntent, invalidateCache, computeAccuracy, normalise };