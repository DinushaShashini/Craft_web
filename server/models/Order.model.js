const mongoose = require('mongoose');

// ─── Order item sub-document ───────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name:          { type: String, required: true },
  price:         { type: Number, required: true },
  quantity:      { type: Number, required: true, min: 1 },
  image:         { type: String },
  customization: { type: String }, // customer's customization text
  category:      { type: String },
});

// ─── Status history entry ──────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

// ─── Main order schema ─────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional — allows guest checkout
    },
    // Snapshot of customer info at time of order
    customerInfo: {
      name:       { type: String, required: true },
      email:      { type: String, required: true },
      phone:      { type: String, required: true },
    },
    shippingAddress: {
      street:     { type: String, required: true },
      city:       { type: String, required: true },
      district:   { type: String, required: true },
      province:   { type: String, required: true },
      postalCode: { type: String },
    },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, 'Order must contain at least one item'],
    },
    deliveryType: {
      type: String,
      enum: ['standard', 'express'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank', 'cod', 'card'],
      required: true,
    },
    // ── Payment status (separate from order status) ────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: {
      // Bank transfer slip ref, etc. — NEVER card numbers
      type: String,
    },
    // ── Financials ─────────────────────────────────────────────
    subtotal:       { type: Number, required: true, min: 0 },
    couponCode:     { type: String },
    couponDiscount: { type: Number, default: 0, min: 0 },
    deliveryFee:    { type: Number, required: true, min: 0 },
    total:          { type: Number, required: true, min: 0 },
    // ── 6-stage order status ───────────────────────────────────
    status: {
      type: String,
      enum: [
        'placed',        // 1. Order Placed
        'payment',       // 2. Payment Confirmed
        'preparing',     // 3. Preparing
        'dispatched',    // 4. Dispatched
        'out',           // 5. Out for Delivery
        'delivered',     // 6. Delivered
        'cancelled',     // Edge case
      ],
      default: 'placed',
    },
    statusHistory: [statusHistorySchema],
    // ── Delivery ───────────────────────────────────────────────
    estimatedDelivery: { type: Date },
    deliveredAt:       { type: Date },
    trackingNumber:    { type: String },
    courierName:       { type: String },
    // ── Notes ─────────────────────────────────────────────────
    notes: { type: String, maxlength: 500 },
    adminNotes: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-generate order number (IMO-YYYY-NNNNN) ─────────────
orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const seq  = String(Math.floor(10000 + Math.random() * 90000));
    this.orderNumber = `IMO-${year}-${seq}`;
  }
  next();
});

// ─── Append status to history whenever status changes ─────────
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
    if (this.status === 'delivered') {
      this.deliveredAt = new Date();
    }
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
