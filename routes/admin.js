/**
 * routes/admin.js
 * Admin-protected intent management endpoints
 */

const express = require('express');
const router  = express.Router();
const {
  adminAuth,
  login,
  getAllIntents,
  getIntentById,
  createIntent,
  updateIntent,
  deleteIntent,
  toggleIntent,
} = require('../controllers/adminController');

// POST  /api/admin/login                 — obtain auth token
router.post('/login', login);

// All routes below require admin auth
router.use(adminAuth);

// GET   /api/admin/intents               — list all intents
router.get('/intents', getAllIntents);

// GET   /api/admin/intents/:id           — get single intent
router.get('/intents/:id', getIntentById);

// POST  /api/admin/intents               — create intent
router.post('/intents', createIntent);

// PUT   /api/admin/intents/:id           — update intent
router.put('/intents/:id', updateIntent);

// DELETE /api/admin/intents/:id          — delete intent
router.delete('/intents/:id', deleteIntent);

// POST  /api/admin/intents/:id/toggle    — activate / deactivate
router.post('/intents/:id/toggle', toggleIntent);

module.exports = router;
