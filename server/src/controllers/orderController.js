const Order     = require('../models/Order');
const Product   = require('../models/Product');
const AppError  = require('../utils/AppError');
const asyncHandler       = require('../utils/asyncHandler');
const generateOrderNumber = require('../utils/generateOrderNumber');

// ── Status → tracking stage mapping ───────────────────────────
const STATUS_TO_STAGE = {
  pending:    0, // Order Placed
  confirmed:  1, // Payment Confirmed
  processing: 2, // Preparing
  shipped:    3, // Dispatched
  delivered:  5, // Delivered
};
// 'out_for_delivery' could be added later as stage 4

const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    phone,
    email,
    address,
    city,
    district,
    province,
    postalCode,
    notes,
    deliveryType,
    paymentMethod,
    items,
    subtotal,
    couponCode,
    couponDiscount,
    deliveryFee,
    total,
  } = req.body;

  if (!customerName || !phone || !email || !address || !city || !district || !province) {
    throw new AppError('Customer contact and address fields are required.', 400);
  }

  if (!paymentMethod) {
    throw new AppError('Payment method is required.', 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item.', 400);
  }

  if (subtotal == null || total == null) {
    throw new AppError('Subtotal and total are required.', 400);
  }

  const orderItems = [];
  for (const item of items) {
    if (!item.name || item.price == null || !item.quantity) {
      throw new AppError('Each item must include name, price, and quantity.', 400);
    }

    let productRef = null;
    if (item.productId || item.id) {
      const productId = item.productId || item.id;
      const product = await Product.findById(productId);
      if (product) {
        productRef = product._id;
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for "${product.name}".`, 400);
        }
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    orderItems.push({
      product: productRef,
      name: item.name,
      category: item.category || '',
      price: item.price,
      quantity: item.quantity,
      customization: item.customization || '',
      images: item.images || [],
    });
  }

  let orderNumber;
  let attempts = 0;
  do {
    orderNumber = generateOrderNumber();
    attempts += 1;
    const exists = await Order.findOne({ orderNumber });
    if (!exists) break;
  } while (attempts < 5);

  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : null,
    customerName,
    phone,
    email,
    address,
    city,
    district,
    province,
    postalCode: postalCode || '',
    notes: notes || '',
    deliveryType: deliveryType || 'standard',
    paymentMethod,
    items: orderItems,
    subtotal,
    couponCode: couponCode || '',
    couponDiscount: couponDiscount || 0,
    deliveryFee: deliveryFee || 0,
    total,
    placedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { phone } = req.query;

  let order;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(id);
  } else {
    order = await Order.findOne({ orderNumber: id.toUpperCase() });
  }

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const isAdmin = req.user && req.user.role === 'admin';
  if (!isAdmin) {
    if (!phone) {
      throw new AppError('Phone number is required to view this order.', 403);
    }
    if (order.phone !== phone.trim()) {
      throw new AppError('Order not found.', 404);
    }
  }

  res.json({
    success: true,
    data: order,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter).sort({ placedAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError('Status is required.', 400);
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  res.json({
    success: true,
    message: 'Order status updated.',
    data: order,
  });
});

const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { phone }       = req.query;

  const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() });

  if (!order) {
    throw new AppError('Order not found. Please check your order number.', 404);
  }

  // Public callers must supply phone for basic verification
  if (!phone || order.phone.replace(/\s/g, '') !== phone.replace(/\s/g, '')) {
    throw new AppError('Phone number does not match. Please try again.', 403);
  }

  const stageIdx = STATUS_TO_STAGE[order.status] ?? 0;

  // Estimated delivery based on stage and delivery type
  const daysLeft = order.deliveryType === 'express'
    ? Math.max(0, 2 - stageIdx)
    : Math.max(0, 5 - stageIdx);

  const estimatedDate = new Date(order.placedAt);
  estimatedDate.setDate(estimatedDate.getDate() + daysLeft);

  res.json({
    success: true,
    data: {
      orderNumber:   order.orderNumber,
      status:        order.status,
      stageIdx,
      customerName:  order.customerName,
      deliveryType:  order.deliveryType,
      paymentMethod: order.paymentMethod,
      placedAt:      order.placedAt,
      estimatedDelivery: order.status === 'delivered'
        ? order.updatedAt
        : estimatedDate,
      itemCount:   order.items.length,
      items:       order.items.map((i) => ({
        name:          i.name,
        quantity:      i.quantity,
        price:         i.price,
        customization: i.customization,
      })),
      subtotal:      order.subtotal,
      couponDiscount:order.couponDiscount,
      deliveryFee:   order.deliveryFee,
      total:         order.total,
      city:          order.city,
      province:      order.province,
    },
  });
});

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  trackOrder,
};

