const asyncHandler = require('../middleware/async-handler');
const { body, param, query } = require('express-validator');
const Conversation = require('../models/conversation.model');
const ChatMessage  = require('../models/chat-message.model');

/** GET /api/chat/conversations — list conversations for current user */
exports.listConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const convs = await Conversation
    .find({ participants: userId })
    .populate('participants', 'username role')
    .populate({ path: 'lastMessage', select: 'text createdAt sender read' })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  // Attach unread count per conversation
  const withUnread = await Promise.all(convs.map(async c => {
    const unread = await ChatMessage.countDocuments({ conversation: c._id, read: false, sender: { $ne: userId } });
    return { ...c, unreadCount: unread };
  }));

  res.json({ data: withUnread });
});

/** POST /api/chat/conversations — start or get existing conversation */
exports.startConversation = [
  body('participantId').isMongoId().withMessage('Valid participant ID required'),
  body('subject').optional().isString().isLength({ max: 100 }),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { participantId, subject } = req.body;

    // Find existing conversation between these two users
    let conv = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    }).populate('participants', 'username role');

    if (!conv) {
      conv = await Conversation.create({
        participants: [userId, participantId],
        subject: subject || 'General',
      });
      await conv.populate('participants', 'username role');
    }
    res.json(conv);
  }),
];

/** GET /api/chat/conversations/:id/messages — paginated messages */
exports.getMessages = [
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const userId  = req.user.id;
    const { id }  = req.params;
    const page    = Math.max(1, parseInt(req.query.page) || 1);
    const limit   = Math.min(100, parseInt(req.query.limit) || 50);

    // Verify participant
    const conv = await Conversation.findOne({ _id: id, participants: userId });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const total = await ChatMessage.countDocuments({ conversation: id });
    const msgs  = await ChatMessage
      .find({ conversation: id })
      .populate('sender', 'username role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Mark fetched messages as read
    await ChatMessage.updateMany(
      { conversation: id, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.json({ data: msgs.reverse(), total, page, totalPages: Math.ceil(total / limit) });
  }),
];

/** POST /api/chat/conversations/:id/messages — send message */
exports.sendMessage = [
  param('id').isMongoId(),
  body('text').isString().notEmpty().isLength({ max: 4000 }).withMessage('Message too long'),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const conv = await Conversation.findOne({ _id: id, participants: userId });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const msg = await ChatMessage.create({
      conversation: id,
      sender: userId,
      text: req.body.text.trim(),
    });

    conv.lastMessage = msg._id;
    conv.updatedAt   = new Date();
    await conv.save();

    await msg.populate('sender', 'username role');
    res.status(201).json(msg);
  }),
];

/** GET /api/chat/unread — total unread count for current user */
exports.unreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const convIds = await Conversation.find({ participants: userId }).distinct('_id');
  const count   = await ChatMessage.countDocuments({
    conversation: { $in: convIds },
    sender: { $ne: userId },
    read: false,
  });
  res.json({ unread: count });
});
