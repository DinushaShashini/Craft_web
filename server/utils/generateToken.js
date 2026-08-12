const jwt = require('jsonwebtoken');

/**
 * Signs a JWT, sets it as an httpOnly cookie, and returns the token string.
 * @param {Object} res   - Express response object
 * @param {string} userId - MongoDB _id of the user
 * @returns {string} token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieExpireDays =
    parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 7;

  res.cookie('jwt', token, {
    httpOnly: true,                          // not accessible via JS (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',                      // CSRF protection
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000, // in ms
  });

  return token;
};

module.exports = generateToken;
