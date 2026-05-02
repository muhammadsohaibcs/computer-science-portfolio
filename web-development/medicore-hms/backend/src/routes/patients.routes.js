const express = require('express');
const router = express.Router();
const patients = require('../controllers/patients.controller');

router.post('/', patients.create);
router.get('/', patients.list);
router.get('/:id', patients.get);
router.put('/:id', patients.update);
router.delete('/:id', patients.remove);

module.exports = router;