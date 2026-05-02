const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const AuthService = require('../services/auth.service');
const OtpService = require('../services/otp.service');
const TwoFAService = require('../services/twofa.service');
const { success, fail } = require('../utils/response');
const {
  registerValidators,
  loginValidators,
  changePasswordValidators,
} = require('../validators/auth.validators');

exports.register = [
  ...registerValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, { errors: errors.array() }, 422);
    const user = await AuthService.register(req.body);
    return success(res, user, 201);
  }),
];

exports.login = [
  ...loginValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, { errors: errors.array() }, 422);
    const tokens = await AuthService.login({
      ...req.body,
      ip: req.ip,
      device: req.get('User-Agent'),
    });
    return success(res, tokens);
  }),
];

exports.refresh = [
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, { error: 'Refresh token is required' }, 400);
    const result = await AuthService.rotateRefreshToken(refreshToken);
    return success(res, result);
  }),
];

exports.logout = [
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, { error: 'Refresh token is required' }, 400);
    await AuthService.logout(refreshToken);
    return success(res, { message: 'Logged out successfully' });
  }),
];

/** Step 1: Request OTP for password change */
exports.requestOtp = [
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const UsersRepo = require('../repositories/users.repo');
    const user = await UsersRepo.findById(userId);
    if (!user) return fail(res, { error: 'User not found' }, 404);
    if (!user.email) return fail(res, { error: 'No email address on file. Please contact your administrator.' }, 400);

    await OtpService.sendOtp(userId, user.email);
    return success(res, { message: `OTP sent to ${user.email.replace(/(.{2}).+(@.+)/, '$1***$2')}` });
  }),
];

/** Step 2: Verify OTP + change password */
exports.changePassword = [
  ...changePasswordValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, { errors: errors.array() }, 422);

    const { currentPassword, newPassword, otp } = req.body;
    const userId = req.user.id;

    // Verify OTP first
    OtpService.verify(userId, otp); // throws on failure

    await AuthService.changePassword(userId, currentPassword, newPassword);
    return success(res, { message: 'Password changed successfully' });
  }),
];

/** GET /api/auth/2fa/status */
exports.get2FAStatus = [
  asyncHandler(async (req, res) => {
    const status = await TwoFAService.getStatus(req.user.id);
    return success(res, status);
  }),
];

/** POST /api/auth/2fa/toggle — { enable: true/false } */
exports.toggle2FA = [
  asyncHandler(async (req, res) => {
    const { enable } = req.body;
    const userId = req.user.id;
    const UsersRepo = require('../repositories/users.repo');
    const user = await UsersRepo.findById(userId);

    if (enable) {
      const result = await TwoFAService.generateSecret(userId, user.username);
      return success(res, result);
    } else {
      // Client sends TOTP code to confirm disable
      const { code } = req.body;
      if (!code) return fail(res, { error: 'TOTP code is required to disable 2FA' }, 400);
      const result = await TwoFAService.disableTwoFA(userId, code);
      return success(res, result);
    }
  }),
];

/** POST /api/auth/2fa/verify — confirm TOTP during setup or login */
exports.verify2FA = [
  asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) return fail(res, { error: 'TOTP code is required' }, 400);

    const userId = req.user.id;
    await TwoFAService.enableTwoFA(userId, code);
    return success(res, { message: '2FA setup confirmed and enabled' });
  }),
];
