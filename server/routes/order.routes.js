const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} = require('../controllers/order.controller');

// ─── Validation rules ──────────────────────────────────────────
const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('customerInfo.name').trim().notEmpty().withMessage('Customer name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.district').trim().notEmpty().withMessage('District is required'),
  body('shippingAddress.province').trim().notEmpty().withMessage('Province is required'),
  body('deliveryType').isIn(['standard', 'express']).withMessage('Invalid delivery type'),
  body('paymentMethod').isIn(['bank', 'cod', 'card']).withMessage('Invalid payment method'),
];

const statusRules = [
  body('status')
    .isIn(['placed', 'payment', 'preparing', 'dispatched', 'out', 'delivered', 'cancelled'])
    .withMessage('Invalid status value'),
];

// ─── Public routes ─────────────────────────────────────────────
router.post('/track', trackOrder);                          // Public order tracking

// ─── Customer routes ───────────────────────────────────────────
router.post('/',    protect, orderRules, createOrder);     // Place order
router.get('/my',   protect, getMyOrders);                  // My orders

// ─── Admin routes ──────────────────────────────────────────────
router.get('/',     protect, isAdmin, getOrders);           // All orders

// ─── Mixed (own or admin) ──────────────────────────────────────
router.get('/:id',  protect, getOrderById);                 // Single order
router.put('/:id/status', protect, isAdmin, statusRules, updateOrderStatus);

module.exports = router;
