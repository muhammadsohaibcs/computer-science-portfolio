const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:         { type: String, required: true, maxlength: 4000 },
  read:         { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ conversation: 1, createdAt: -1 });
module.exports = mongoose.model('ChatMessage', chatMessageSchema);
