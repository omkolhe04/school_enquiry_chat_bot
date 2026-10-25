/**
 * controllers/adminController.js
 * CRUD operations for intents + admin authentication
 */

const Intent = require('../models/Intent');
const { invalidateCache } = require('../services/nlpService');

// ─── Simple token-based auth middleware ───────────────────────────────────────
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';
  const expected  = Buffer.from(`${validUser}:${validPass}`).toString('base64');

  if (!token || token !== expected) {
    return res.status(401).json({ success: false, error: 'Unauthorised. Provide a valid admin token.' });
  }
  next();
};

// ─── POST /api/admin/login ────────────────────────────────────────────────────
const login = (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === validUser && password === validPass) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.json({ success: true, token, message: 'Login successful' });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials.' });
};

// ─── GET /api/admin/intents ───────────────────────────────────────────────────
const getAllIntents = async (req, res) => {
  try {
    const category = req.query.category;
    const query    = category ? { category } : {};
    const intents  = await Intent.find(query).sort({ category: 1, intentName: 1 }).lean();
    return res.json({ success: true, intents, total: intents.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/admin/intents/:id ───────────────────────────────────────────────
const getIntentById = async (req, res) => {
  try {
    const intent = await Intent.findById(req.params.id).lean();
    if (!intent) return res.status(404).json({ success: false, error: 'Intent not found.' });
    return res.json({ success: true, intent });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/admin/intents ──────────────────────────────────────────────────
const createIntent = async (req, res) => {
  try {
    const intent = new Intent(req.body);
    await intent.save();
    await invalidateCache();
    return res.status(201).json({ success: true, intent, message: 'Intent created successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Intent name already exists.' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
};

// ─── PUT /api/admin/intents/:id ───────────────────────────────────────────────
const updateIntent = async (req, res) => {
  try {
    const intent = await Intent.findByIdAndUpdate(req.params.id, req.body, {
      new:          true,
      runValidators: true,
    });
    if (!intent) return res.status(404).json({ success: false, error: 'Intent not found.' });
    await invalidateCache();
    return res.json({ success: true, intent, message: 'Intent updated successfully.' });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// ─── DELETE /api/admin/intents/:id ───────────────────────────────────────────
const deleteIntent = async (req, res) => {
  try {
    const intent = await Intent.findByIdAndDelete(req.params.id);
    if (!intent) return res.status(404).json({ success: false, error: 'Intent not found.' });
    await invalidateCache();
    return res.json({ success: true, message: `Intent "${intent.intentName}" deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/admin/intents/:id/toggle ──────────────────────────────────────
const toggleIntent = async (req, res) => {
  try {
    const intent = await Intent.findById(req.params.id);
    if (!intent) return res.status(404).json({ success: false, error: 'Intent not found.' });
    intent.isActive = !intent.isActive;
    await intent.save();
    await invalidateCache();
    return res.json({
      success: true,
      isActive: intent.isActive,
      message: `Intent ${intent.isActive ? 'activated' : 'deactivated'}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { adminAuth, login, getAllIntents, getIntentById, createIntent, updateIntent, deleteIntent, toggleIntent };
