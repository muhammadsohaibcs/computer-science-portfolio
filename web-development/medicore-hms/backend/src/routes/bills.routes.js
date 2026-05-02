const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bills.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/patient/:patientId', ctrl.listByPatient);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/pay', ctrl.pay);

module.exports = router;