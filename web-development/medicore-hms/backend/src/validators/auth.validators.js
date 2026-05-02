const { body } = require('express-validator');

const passwordStrengthValidator = body('newPassword')
  .isString()
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Must contain at least one special character');

exports.registerValidators = [
  body('username').isString().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isString().isIn(['Admin','Doctor','Nurse','Receptionist','Patient','Lab Technician','Pharmacist','HOD']).withMessage('Invalid role'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
];

exports.loginValidators = [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

exports.changePasswordValidators = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  passwordStrengthValidator,
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').matches(/^\d{6}$/).withMessage('OTP must be numeric'),
];
