const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderNumber = require('../utils/generateOrderNumber');

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

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
