const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  subject:      { type: String, default: 'General' },
  patientRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', sparse: true },
  lastMessage:  { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
module.exports = mongoose.model('Conversation', conversationSchema);
