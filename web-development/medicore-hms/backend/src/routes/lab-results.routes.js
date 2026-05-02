const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lab-results.controller');

router.post('/',               ctrl.create);
router.post('/upload',         ctrl.uploadFile);   // ← new multipart upload
router.get('/',                ctrl.list);
router.get('/patient/:patientId', ctrl.listByPatient);
router.post('/:id/attachment', ctrl.addAttachment);
router.get('/:id',             ctrl.get);
router.delete('/:id',          ctrl.remove);

module.exports = router;
