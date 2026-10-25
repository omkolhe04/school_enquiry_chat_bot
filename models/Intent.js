/**
 * models/Intent.js
 * Schema for storing NLP intents, training phrases, and responses
 */

const mongoose = require('mongoose');

const IntentSchema = new mongoose.Schema(
  {
    // Unique identifier for the intent  e.g. "admission_process"
    intentName: {
      type: String,
      required: [true, 'Intent name is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Human-readable display label
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },

    // Category grouping (admissions | academics | fees | campus | contact | events)
    category: {
      type: String,
      required: true,
      enum: ['admissions', 'academics', 'fees', 'campus', 'contact', 'events', 'general'],
      default: 'general',
    },

    // Example phrases used for NLP intent matching
    trainingPhrases: {
      type: [String],
      required: [true, 'At least one training phrase is required'],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'At least one training phrase is required',
      },
    },

    // Multiple response variants (system picks randomly for variety)
    responses: {
      type: [String],
      required: [true, 'At least one response is required'],
    },

    // Named entities that can be extracted from the query
    entities: {
      type: [String],
      default: [],
    },

    // Whether this intent is active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Usage count — incremented on every match
    hitCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Text index for fast full-text search on training phrases
IntentSchema.index({ trainingPhrases: 'text', displayName: 'text' });

module.exports = mongoose.model('Intent', IntentSchema);
