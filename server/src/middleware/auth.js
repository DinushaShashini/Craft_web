const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    throw new AppError('Session expired. Please log in again.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.secret);
  } catch {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  req.user = user;
  req.token = token;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      req.token = token;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
});

module.exports = { protect, optionalAuth, extractToken };
