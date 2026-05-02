const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rooms.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.post('/assign', ctrl.assign);
router.post('/release', ctrl.release);

module.exports = router;