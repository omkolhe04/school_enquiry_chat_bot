/**
 * routes/liveChat.js
 * Live chat REST API endpoints (admin-protected)
 */

const express    = require('express');
const router     = express.Router();
const {
  getQueue, getActiveChats, getStats,
  getSession, getAllChats, closeSession, rateSession,
} = require('../controllers/liveChatController');

// Simple admin auth middleware (reused from adminController pattern)
const adminAuth = (req, res, next) => {
  const token    = req.headers['authorization']?.split(' ')[1];
  const expected = Buffer.from(
    `${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'admin123'}`
  ).toString('base64');
  if (!token || token !== expected) {
    return res.status(401).json({ success: false, error: 'Unauthorised' });
  }
  next();
};

// Public routes (student-facing)
router.post('/session/:roomId/rate', rateSession);

// Admin-protected routes
router.use(adminAuth);
router.get('/queue',              getQueue);
router.get('/active',             getActiveChats);
router.get('/stats',              getStats);
router.get('/history',            getAllChats);
router.get('/session/:roomId',    getSession);
router.post('/session/:roomId/close', closeSession);

module.exports = router;
