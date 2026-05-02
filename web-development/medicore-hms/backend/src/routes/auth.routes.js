const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// ── Public routes ─────────────────────────────────────
router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.post('/refresh',  authCtrl.refresh);
router.post('/logout',   authCtrl.logout);

// ── Protected routes (require valid JWT) ──────────────
router.post('/request-otp',     authMiddleware(), authCtrl.requestOtp);
router.post('/change-password', authMiddleware(), authCtrl.changePassword);

// ── 2FA routes ────────────────────────────────────────
router.get('/2fa/status',  authMiddleware(), authCtrl.get2FAStatus);
router.post('/2fa/toggle', authMiddleware(), authCtrl.toggle2FA);
router.post('/2fa/verify', authMiddleware(), authCtrl.verify2FA);

module.exports = router;
