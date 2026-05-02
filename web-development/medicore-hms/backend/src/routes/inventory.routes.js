const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventory.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/low-stock', ctrl.lowStock);
router.get('/code/:code', ctrl.getItem);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/decrement', ctrl.decrement);
router.post('/bulk', ctrl.bulkAdjust);

module.exports = router;