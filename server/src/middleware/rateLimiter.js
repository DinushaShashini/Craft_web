/**
 * Simple in-memory rate limiter.
 * For production, replace with express-rate-limit + Redis.
 *
 * Usage:
 *   rateLimiter(maxRequests, windowMs)
 *   router.post('/login', rateLimiter(10, 15 * 60 * 1000), login);
 */

const store = new Map(); // ip -> { count, resetAt }

function rateLimiter(max = 100, windowMs = 15 * 60 * 1000) {
  return function rateLimit(req, res, next) {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store.has(key) || store.get(key).resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const entry = store.get(key);
    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      });
    }

    next();
  };
}

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 10 * 60 * 1000);

module.exports = rateLimiter;
