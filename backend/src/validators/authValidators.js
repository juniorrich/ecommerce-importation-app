const { body } = require('express-validator');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('A valid email is required')
    .normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Invalid phone number'),
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

exports.updateDetailsRules = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid name'),
  body('email').optional().trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Invalid phone number'),
  body('address').optional().isObject().withMessage('Invalid address'),
];
