/**
 * IMO Craft – Express API Server
 * ─────────────────────────────────────────────────────────────
 * Start: npm run server:dev   (development with nodemon)
 *        npm run server:start (production)
 */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');

const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes    = require('./routes/order.routes');

// ─── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ─── Security middleware ───────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — only allow the configured frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,      // allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));         // limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Rate limiting on sensitive routes ────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 auth attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎨 IMO Craft API is running.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── 404 for unknown routes ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler (MUST be last) ──────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  IMO Craft API running on http://localhost:${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
});
