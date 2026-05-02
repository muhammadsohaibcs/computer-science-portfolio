const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/insurance.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/patient/:patientId', ctrl.listByPatient);
router.post('/validate', ctrl.validate);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
