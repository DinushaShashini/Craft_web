const AppError = require('../utils/AppError');

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Admin access required.', 403);
  }
  next();
}

module.exports = adminOnly;
