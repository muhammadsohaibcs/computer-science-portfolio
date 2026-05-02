const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/staff.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/department/:deptId', ctrl.listByDept);
router.get('/user/:userId', ctrl.getByUser);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;