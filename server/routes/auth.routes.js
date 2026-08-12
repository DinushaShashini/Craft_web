const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
} = require('../controllers/auth.controller');

// ─── Validation rules ──────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Routes ───────────────────────────────────────────────────
router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.post('/logout',   protect,       logout);
router.get('/me',        protect,       getMe);
router.put('/me',        protect,       updateMe);

module.exports = router;
