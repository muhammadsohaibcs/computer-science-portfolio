const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/chat.controller');

router.use(auth());

router.get('/conversations',              ctrl.listConversations);
router.post('/conversations',             ctrl.startConversation);
router.get('/conversations/:id/messages', ctrl.getMessages);
router.post('/conversations/:id/messages',ctrl.sendMessage);
router.get('/unread',                     ctrl.unreadCount);

module.exports = router;
