/**
 * models/LiveChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Schema for live chat sessions between students and admins.
 * Triggered when chatbot confidence is below threshold.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');

// ── Individual message within a live chat ─────────────────────────────────────
const LiveMessageSchema = new mongoose.Schema(
  {
    sender:      { type: String, enum: ['student', 'admin', 'bot', 'system'], required: true },
    senderName:  { type: String, default: 'Unknown' },
    text:        { type: String, required: true },
    timestamp:   { type: Date, default: Date.now },
    isRead:      { type: Boolean, default: false },
    lang:        { type: String, default: 'en' }, // language of the message
  },
  { _id: false }
);

// ── Live Chat Session ─────────────────────────────────────────────────────────
const LiveChatSchema = new mongoose.Schema(
  {
    // Student info
    studentSocketId: { type: String, required: true },
    studentId:       { type: String, default: 'anonymous' },
    studentName:     { type: String, default: 'Student' },
    sessionId:       { type: String, required: true, index: true },

    // Admin info (populated when admin accepts)
    adminSocketId:   { type: String, default: null },
    adminId:         { type: String, default: null },
    adminName:       { type: String, default: null },

    // Chat status
    status: {
      type:    String,
      enum:    ['queued', 'active', 'closed', 'abandoned'],
      default: 'queued',
      index:   true,
    },

    // Room identifier for Socket.io
    roomId: { type: String, required: true, unique: true },

    // All messages
    messages: [LiveMessageSchema],

    // Meta
    language:        { type: String, default: 'en' },
    subject:         { type: String, default: 'General Query' },
    triggerMessage:  { type: String, default: '' }, // the message that triggered live chat
    triggerConfidence: { type: Number, default: 0 },

    // Timestamps
    queuedAt:    { type: Date, default: Date.now },
    acceptedAt:  { type: Date, default: null },
    closedAt:    { type: Date, default: null },

    // Ratings (optional student feedback)
    rating:    { type: Number, min: 1, max: 5, default: null },
    feedback:  { type: String, default: null },

    // Unread counts
    unreadByAdmin:   { type: Number, default: 0 },
    unreadByStudent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
LiveChatSchema.virtual('duration').get(function () {
  if (!this.acceptedAt) return null;
  const end = this.closedAt || new Date();
  return Math.round((end - this.acceptedAt) / 60000); // minutes
});

LiveChatSchema.virtual('waitTime').get(function () {
  if (!this.queuedAt) return null;
  const end = this.acceptedAt || new Date();
  return Math.round((end - this.queuedAt) / 1000); // seconds
});

// ── Pre-save hook ─────────────────────────────────────────────────────────────
LiveChatSchema.pre('save', function (next) {
  if (this.isNew) {
    this.roomId = this.roomId || `live_${this.sessionId}_${Date.now()}`;
  }
  next();
});

// ── Static methods ────────────────────────────────────────────────────────────
LiveChatSchema.statics.getQueue = function () {
  return this.find({ status: 'queued' }).sort({ queuedAt: 1 }).lean();
};

LiveChatSchema.statics.getActiveChats = function () {
  return this.find({ status: 'active' }).sort({ acceptedAt: -1 }).lean();
};

LiveChatSchema.statics.getStats = async function () {
  const [total, queued, active, closed] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'queued' }),
    this.countDocuments({ status: 'active' }),
    this.countDocuments({ status: 'closed' }),
  ]);
  return { total, queued, active, closed };
};

module.exports = mongoose.model('LiveChat', LiveChatSchema);