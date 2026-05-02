const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/records.controller');

router.post('/', ctrl.addRecord);
router.get('/', ctrl.list);
router.get('/patient/:patientId', ctrl.listByPatient);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/attachment', ctrl.addAttachment);

module.exports = router;