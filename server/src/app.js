const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const rateLimiter = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ============================================================
// SECURITY HEADERS
// ============================================================

app.disable('x-powered-by');

app.use((req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Legacy XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent browsers from unnecessarily loading resources
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
});

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: env.corsOrigin,

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// ============================================================
// BODY PARSERS
// ============================================================

// JSON request body
app.use(
  express.json({
    limit: '1mb',
  })
);

// URL-encoded request body
app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Imo Craft API is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// DEVELOPMENT REQUEST LOGGER
// ============================================================

if (env.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();
  });
}

// ============================================================
// GLOBAL RATE LIMITER
// ============================================================

// 100 requests per 15 minutes per IP
app.use(
  rateLimiter(
    100,
    15 * 60 * 1000
  )
);

// ============================================================
// API ROUTES
// ============================================================

app.use('/api', routes);

// ============================================================
// API 404 HANDLER
// ============================================================

app.use(notFound);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// EXPORT APP
// ============================================================

module.exports = app;