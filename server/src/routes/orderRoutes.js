const express = require('express');
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
