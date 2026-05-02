/**
 * stats.routes.js
 * 
 * Dashboard statistics routes
 */

const express = require('express');
const router = express.Router();
const statsCtrl = require('../controllers/stats.controller');

router.get('/', statsCtrl.getDashboardStats);

module.exports = router;
