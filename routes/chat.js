/**
 * routes/chat.js
 * Public chat endpoints
 */

const express = require('express');
const router  = express.Router();
const {
  sendMessage,
  getHistory,
  getSessions,
  getStats,
} = require('../controllers/chatController');

// POST   /api/chat               — send a message, get NLP response
router.post('/', sendMessage);

// GET    /api/chat/stats          — global accuracy & count stats
router.get('/stats', getStats);

// GET    /api/chat/sessions        — list all sessions (paginated)
router.get('/sessions', getSessions);

// GET    /api/chat/history/:sid   — conversation history for a session
router.get('/history/:sessionId', getHistory);

module.exports = router;
