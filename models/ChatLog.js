/**
 * models/ChatLog.js
 * Schema for persisting every user interaction
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Bot-only metadata
    intent: { type: String, default: null },
    confidence: { type: Number, default: null },
    entities: { type: [String], default: [] },
  },
  { _id: false }
);

const ChatLogSchema = new mongoose.Schema(
  {
    // Unique session identifier (UUID generated on the client)
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // Optional: if user logs in
    userId: {
      type: String,
      default: 'anonymous',
    },

    messages: [MessageSchema],

    // Aggregated session stats
    totalMessages: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },  // intents matched
    fallbackCount: { type: Number, default: 0 },  // fallbacks triggered

    // Last activity timestamp (for TTL or cleanup)
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update lastActivity on every save
ChatLogSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
