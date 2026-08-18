const express     = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const rateLimiter  = require('../middleware/rateLimiter');
const validate     = require('../middleware/validate');

const router = express.Router();

// Stricter rate limit on auth routes (20 req / 15 min)
const authRateLimit = rateLimiter(20, 15 * 60 * 1000);

router.post(
  '/register',
  authRateLimit,
  validate({
    body: {
      name:     { required: true, minLength: 2, maxLength: 80 },
      email:    { required: true, type: 'email' },
      password: { required: true, minLength: 8, maxLength: 128 },
    },
  }),
  register
);

router.post(
  '/login',
  authRateLimit,
  validate({
    body: {
      email:    { required: true, type: 'email' },
      password: { required: true },
    },
  }),
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
