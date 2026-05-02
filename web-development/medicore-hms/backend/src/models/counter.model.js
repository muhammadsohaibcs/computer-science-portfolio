const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  prefix: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Index for fast lookups
counterSchema.index({ prefix: 1 }, { unique: true });

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
