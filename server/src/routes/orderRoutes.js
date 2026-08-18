const express  = require('express');
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  trackOrder,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const adminOnly  = require('../middleware/admin');
const validate   = require('../middleware/validate');

const router = express.Router();

// ── Public: place order (guests allowed) ──────────────────────
router.post(
  '/',
  optionalAuth,
  validate({
    body: {
      customerName:  { required: true, minLength: 2, maxLength: 100 },
      phone:         { required: true, pattern: /^0[0-9]{9}$/, patternMessage: 'phone must be a valid Sri Lankan number (e.g. 0771234567).' },
      email:         { required: true, type: 'email' },
      address:       { required: true },
      city:          { required: true },
      district:      { required: true },
      province:      { required: true },
      paymentMethod: { required: true, enum: ['bank', 'cod', 'card'] },
      deliveryType:  { enum: ['standard', 'express'] },
    },
  }),
  createOrder
);

// ── Public: track order by orderNumber + phone ────────────────
// GET /api/orders/track/:orderNumber?phone=07XXXXXXXX
router.get('/track/:orderNumber', trackOrder);

// ── Admin only: list all orders ───────────────────────────────
router.get('/', protect, adminOnly, getOrders);

// ── Public/Admin: get order by ID or order number ────────────
// Public callers must provide ?phone= for verification
router.get('/:id', optionalAuth, getOrderById);

// ── Admin only: update order status ──────────────────────────
router.put(
  '/:id/status',
  protect,
  adminOnly,
  validate({
    body: {
      status: {
        required: true,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      },
    },
  }),
  updateOrderStatus
);

module.exports = router;
