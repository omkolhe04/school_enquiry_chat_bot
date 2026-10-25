/**
 * routes/translation.js
 * Translation API endpoints
 */

const express = require('express');
const router  = express.Router();
const {
  translate, translateToEnglish, translateFromEnglish,
  detectLanguage, getSupportedLanguages, getCacheStats,
} = require('../services/translationService');

// GET  /api/translate/languages — list supported languages
router.get('/languages', (req, res) => {
  res.json({ success: true, languages: getSupportedLanguages() });
});

// POST /api/translate — translate text
router.post('/', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'auto' } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text is required' });
    if (!targetLang) return res.status(400).json({ success: false, error: 'targetLang is required' });

    const translated = await translate(text, targetLang, sourceLang);
    res.json({ success: true, original: text, translated, targetLang, sourceLang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/detect — detect language
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text is required' });
    const lang = await detectLanguage(text);
    res.json({ success: true, lang, text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/translate/cache — cache statistics
router.get('/cache', (req, res) => {
  res.json({ success: true, cache: getCacheStats() });
});

module.exports = router;
