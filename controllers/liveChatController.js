/**
 * controllers/liveChatController.js
 * REST endpoints for live chat management (admin API)
 */

const LiveChat        = require('../models/LiveChat');
const liveChatService = require('../services/liveChatService');

// GET /api/livechat/queue — get all queued chats
const getQueue = async (req, res) => {
  try {
    const queue = await liveChatService.getQueue();
    res.json({ success: true, queue, count: queue.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/livechat/active — get all active chats
const getActiveChats = async (req, res) => {
  try {
    const chats = await liveChatService.getActiveChats();
    res.json({ success: true, chats, count: chats.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/livechat/stats — aggregated statistics
const getStats = async (req, res) => {
  try {
    const [stats, admins] = await Promise.all([
      liveChatService.getStats(),
      Promise.resolve(liveChatService.getAllAdmins()),
    ]);
    res.json({
      success: true,
      stats,
      admins: {
        total:     admins.length,
        available: admins.filter(a => !a.busy).length,
        busy:      admins.filter(a => a.busy).length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/livechat/session/:roomId — get chat history for a room
const getSession = async (req, res) => {
  try {
    const chat = await liveChatService.getSession(req.params.roomId);
    if (!chat) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/livechat/history — all chats (paginated)
const getAllChats = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const { chats, total } = await LiveChat.list({ status, page, limit });

    res.json({ success: true, chats, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/livechat/session/:roomId/close — force close a session
const closeSession = async (req, res) => {
  try {
    const chat = await liveChatService.closeSession(req.params.roomId, 'admin-api');
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/livechat/session/:roomId/rate — student rates the session
const rateSession = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be 1–5' });
    }
    const chat = await liveChatService.rateSession(req.params.roomId, rating, feedback);
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getQueue, getActiveChats, getStats, getSession, getAllChats, closeSession, rateSession };
