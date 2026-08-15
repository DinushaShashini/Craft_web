const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'user',
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    token,
    user: formatUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: formatUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  if (!req.token) {
    throw new AppError('No active session to log out.', 400);
  }

  let expiresAt;
  try {
    const decoded = jwt.verify(req.token, env.jwt.secret);
    expiresAt = new Date(decoded.exp * 1000);
  } catch {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  await TokenBlacklist.findOneAndUpdate(
    { token: req.token },
    { token: req.token, expiresAt },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: formatUser(req.user),
  });
});

module.exports = { register, login, logout, getMe };
