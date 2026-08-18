const express    = require('express');
const cors       = require('cors');
const env        = require('./config/env');
const routes     = require('./routes');
const rateLimiter = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security headers ───────────────────────────────────────────
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  next();
});

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Dev request logger ─────────────────────────────────────────
if (env.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method}  ${req.originalUrl}`);
    next();
  });
}

// ── Global rate limit (100 req / 15 min per IP) ────────────────
app.use(rateLimiter(100, 15 * 60 * 1000));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error handling ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

