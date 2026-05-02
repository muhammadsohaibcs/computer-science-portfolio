const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suppliers.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/:id/add-item', ctrl.addSuppliedItem);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;