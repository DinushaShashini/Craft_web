const { validationResult } = require('express-validator');
const Order   = require('../models/Order.model');
const Product = require('../models/Product.model');

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────
// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (logged-in customer or guest with info)
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const {
      items,
      customerInfo,
      shippingAddress,
      deliveryType,
      paymentMethod,
      couponCode,
      couponDiscount = 0,
      deliveryFee,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items.' });
    }

    // ── Verify products & calculate server-side subtotal ───────
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product not found or unavailable: ${item.name || item.product}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      subtotal += product.price * item.quantity;
      verifiedItems.push({
        product:       product._id,
        name:          product.name,
        price:         product.price,  // server-side price, not client-supplied
        quantity:      item.quantity,
        image:         product.images?.[0] || '',
        customization: item.customization || '',
        category:      product.category?.toString() || '',
      });
    }

    // ── Validate totals ────────────────────────────────────────
    const expectedTotal = Math.max(0, subtotal - couponDiscount) + Number(deliveryFee || 0);

    // ── Deduct stock (optimistic, no payment gate yet) ─────────
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // ── Estimate delivery date ─────────────────────────────────
    const daysToAdd   = deliveryType === 'express' ? 2 : 5;
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + daysToAdd);

    const order = await Order.create({
      user:            req.user?._id,  // undefined if guest
      customerInfo,
      shippingAddress,
      items:           verifiedItems,
      deliveryType,
      paymentMethod,
      couponCode,
      couponDiscount:  Number(couponDiscount),
      subtotal,
      deliveryFee:     Number(deliveryFee || 0),
      total:           expectedTotal,
      estimatedDelivery: estDelivery,
      notes,
      status:          'placed',
      statusHistory:   [{ status: 'placed' }],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      orderNumber: order.orderNumber,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
// ─────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get current user's orders
// @route   GET /api/orders/my
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .lean();

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get order by ID or order number
// @route   GET /api/orders/:id
// @access  Private (own order or admin) | Public (by orderNumber)
// ─────────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const idOrNumber = req.params.id;

    // Support lookup by either MongoDB _id or orderNumber
    const isMongoId = /^[a-f\d]{24}$/i.test(idOrNumber);
    const order = await Order.findOne(
      isMongoId ? { _id: idOrNumber } : { orderNumber: idOrNumber }
    ).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Non-admins can only view their own orders
    if (
      req.user &&
      req.user.role !== 'admin' &&
      order.user?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
// ─────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, paymentStatus, trackingNumber, courierName } = req.body;

    const VALID_STATUSES = ['placed', 'payment', 'preparing', 'dispatched', 'out', 'delivered', 'cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: "${status}".` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.status = status;
    if (note)           order.statusHistory[order.statusHistory.length - 1].note = note;
    if (paymentStatus)  order.paymentStatus  = paymentStatus;
    if (trackingNumber) order.trackingNumber  = trackingNumber;
    if (courierName)    order.courierName     = courierName;

    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to "${status}".`, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Public order tracking (by orderNumber + phone)
// @route   POST /api/orders/track
// @access  Public
// ─────────────────────────────────────────────────────────────
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required.' });
    }

    const order = await Order.findOne({ orderNumber }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If phone is supplied, verify it matches (prevents random tracking)
    if (phone && order.customerInfo.phone !== phone) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Return only safe fields — no internal admin notes
    const safeOrder = {
      orderNumber:      order.orderNumber,
      status:           order.status,
      statusHistory:    order.statusHistory,
      estimatedDelivery:order.estimatedDelivery,
      deliveredAt:      order.deliveredAt,
      trackingNumber:   order.trackingNumber,
      courierName:      order.courierName,
      deliveryType:     order.deliveryType,
      items:            order.items.map(i => ({
        name: i.name, quantity: i.quantity, price: i.price, image: i.image,
      })),
      subtotal:         order.subtotal,
      couponDiscount:   order.couponDiscount,
      deliveryFee:      order.deliveryFee,
      total:            order.total,
      createdAt:        order.createdAt,
    };

    res.status(200).json({ success: true, order: safeOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
};
