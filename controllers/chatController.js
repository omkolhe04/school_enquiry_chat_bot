/**
 * controllers/chatController.js
 * Handles incoming chat messages, runs NLP, persists logs.
 */

const ChatLog = require('../models/ChatLog');
const { classifyIntent } = require('../services/nlpService');

// ─── POST /api/chat ───────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, userId = 'anonymous' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    // ── 1. Run NLP classification ──────────────────────────────────────────
    const nlpResult = await classifyIntent(message.trim());

    // ── 2. Persist to MongoDB ──────────────────────────────────────────────
    let session = await ChatLog.findOne({ sessionId });

    const userMsg = {
      role:      'user',
      text:      message.trim(),
      timestamp: new Date(),
    };

    const botMsg = {
      role:       'bot',
      text:       nlpResult.response,
      timestamp:  new Date(),
      intent:     nlpResult.intent,
      confidence: nlpResult.confidence,
      entities:   nlpResult.entities,
    };

    if (!session) {
      session = new ChatLog({
        sessionId,
        userId,
        messages: [userMsg, botMsg],
        totalMessages:  2,
        resolvedCount:  nlpResult.isFallback ? 0 : 1,
        fallbackCount:  nlpResult.isFallback ? 1 : 0,
      });
    } else {
      session.messages.push(userMsg, botMsg);
      session.totalMessages  += 2;
      if (nlpResult.isFallback) session.fallbackCount  += 1;
      else                      session.resolvedCount  += 1;
    }

    await session.save();

    // ── 3. Return response ─────────────────────────────────────────────────
    return res.json({
      success:    true,
      sessionId,
      message:    nlpResult.response,
      intent:     nlpResult.intent,
      displayName: nlpResult.displayName,
      confidence: nlpResult.confidence,
      entities:   nlpResult.entities,
      isFallback: nlpResult.isFallback,
      // Debug info (remove in production if needed)
      topScores:  nlpResult.allScores.slice(0, 5),
    });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── GET /api/chat/history/:sessionId ────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatLog.findOne({ sessionId }).lean();

    if (!session) {
      return res.json({ success: true, messages: [], stats: {} });
    }

    return res.json({
      success:  true,
      messages: session.messages,
      stats: {
        total:     session.totalMessages,
        resolved:  session.resolvedCount,
        fallbacks: session.fallbackCount,
      },
    });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch history.' });
  }
};

// ─── GET /api/chat/sessions ───────────────────────────────────────────────────
const getSessions = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const sessions = await ChatLog
      .find()
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('sessionId userId totalMessages resolvedCount fallbackCount lastActivity createdAt')
      .lean();

    const total = await ChatLog.countDocuments();

    return res.json({ success: true, sessions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Sessions error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch sessions.' });
  }
};

// ─── GET /api/chat/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totals] = await ChatLog.aggregate([
      {
        $group: {
          _id:           null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: '$totalMessages' },
          totalResolved: { $sum: '$resolvedCount' },
          totalFallback: { $sum: '$fallbackCount' },
        },
      },
    ]);

    if (!totals) {
      return res.json({ success: true, stats: { accuracy: 0, totalSessions: 0 } });
    }

    const accuracy =
      totals.totalResolved + totals.totalFallback === 0
        ? 0
        : +(
            (totals.totalResolved / (totals.totalResolved + totals.totalFallback)) * 100
          ).toFixed(2);

    return res.json({
      success: true,
      stats: {
        totalSessions: totals.totalSessions,
        totalMessages: totals.totalMessages,
        totalResolved: totals.totalResolved,
        totalFallback: totals.totalFallback,
        accuracy,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, error: 'Failed to compute stats.' });
  }
};

module.exports = { sendMessage, getHistory, getSessions, getStats };
