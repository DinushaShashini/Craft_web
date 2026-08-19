const mongoose = require("mongoose");

// ============================================================
// ALLOWED ENUM VALUES
// ============================================================

// Order lifecycle
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

// Payment lifecycle
const PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "partially_paid",
  "refunded",
  "failed",
];

// Available payment methods
const PAYMENT_METHODS = [
  "bank_transfer",
  "card",
  "cash_on_delivery",
];

// Delivery options
const DELIVERY_TYPES = [
  "standard",
  "express",
];

// ============================================================
// ORDER ITEM SUB-DOCUMENT
// ============================================================
// This stores a snapshot of the product at the time the order
// was placed.
//
// If the admin later changes the product price/name/image,
// the old order will still contain the original information.
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // Product reference
    // ----------------------------------------------------------

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // ----------------------------------------------------------
    // Product snapshot
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Item price cannot be negative"],
    },

    quantity: {
      type: Number,
      required: [true, "Item quantity is required"],
      min: [1, "Quantity must be at least 1"],

      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    images: {
      type: [String],
      default: [],
    },

    // ----------------------------------------------------------
    // Customer customization
    // ----------------------------------------------------------

    customization: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // ----------------------------------------------------------
    // Calculated line total
    // price × quantity
    // ----------------------------------------------------------

    lineTotal: {
      type: Number,
      min: [0, "Line total cannot be negative"],
      default: 0,
    },
  },

  {
    _id: true,
  }
);

// ============================================================
// CUSTOMER INFORMATION SNAPSHOT
// ============================================================

const customerInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid customer email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      match: [
        /^[0-9+\-\s()]{7,20}$/,
        "Please provide a valid customer phone number",
      ],
    },
  },

  {
    _id: false,
  }
);

// ============================================================
// DELIVERY ADDRESS SNAPSHOT
// ============================================================
// The address is copied into the order so that if the customer
// changes their saved address later, the old order remains
// unchanged.
// ============================================================

const deliveryAddressSchema = new mongoose.Schema(
  {
    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 200,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 80,
    },

    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      maxlength: 80,
    },

    province: {
      type: String,
      required: [true, "Province is required"],
      trim: true,
      maxlength: 80,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },

  {
    _id: false,
  }
);

// ============================================================
// ORDER STATUS HISTORY
// ============================================================

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: "Invalid order status",
      },
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  {
    _id: false,
  }
);

// ============================================================
// MAIN ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // ORDER NUMBER
    // Example: IMO-2026-00001
    // ----------------------------------------------------------

    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },

    // ----------------------------------------------------------
    // USER
    // ----------------------------------------------------------
    // Can be null if guest checkout is allowed.
    // ----------------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ----------------------------------------------------------
    // ORDER ITEMS
    // ----------------------------------------------------------

    items: {
      type: [orderItemSchema],

      validate: [
        {
          validator: (items) => items.length > 0,
          message: "Order must contain at least one item",
        },
      ],
    },

    // ----------------------------------------------------------
    // PRICING
    // ----------------------------------------------------------

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, "Delivery fee cannot be negative"],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },

    // ----------------------------------------------------------
    // CUSTOMER INFORMATION
    // ----------------------------------------------------------

    customerInformation: {
      type: customerInfoSchema,
      required: [true, "Customer information is required"],
    },

    // ----------------------------------------------------------
    // DELIVERY ADDRESS
    // ----------------------------------------------------------

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, "Delivery address is required"],
    },

    // ----------------------------------------------------------
    // DELIVERY TYPE
    // ----------------------------------------------------------

    deliveryType: {
      type: String,

      enum: {
        values: DELIVERY_TYPES,
        message: "Invalid delivery type",
      },

      default: "standard",
    },

    // ----------------------------------------------------------
    // PAYMENT METHOD
    // ----------------------------------------------------------

    paymentMethod: {
      type: String,

      enum: {
        values: PAYMENT_METHODS,
        message: "Invalid payment method",
      },

      required: [true, "Payment method is required"],
    },

    // ----------------------------------------------------------
    // PAYMENT STATUS
    // ----------------------------------------------------------

    paymentStatus: {
      type: String,

      enum: {
        values: PAYMENT_STATUSES,
        message: "Invalid payment status",
      },

      default: "unpaid",
    },

    // ----------------------------------------------------------
    // PAYMENT REFERENCE
    // ----------------------------------------------------------
    // Useful for bank transfers or payment gateway references.
    // ----------------------------------------------------------

    paymentReference: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ----------------------------------------------------------
    // ORDER STATUS
    // ----------------------------------------------------------

    orderStatus: {
      type: String,

      enum: {
        values: ORDER_STATUSES,
        message: "Invalid order status",
      },

      default: "pending",
    },

    // ----------------------------------------------------------
    // STATUS HISTORY
    // ----------------------------------------------------------

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    // ----------------------------------------------------------
    // ESTIMATED DELIVERY
    // ----------------------------------------------------------

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    // ----------------------------------------------------------
    // COURIER TRACKING REFERENCE
    // ----------------------------------------------------------

    trackingReference: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ----------------------------------------------------------
    // ADMIN NOTES
    // ----------------------------------------------------------
    // Internal information that customers should not see.
    // ----------------------------------------------------------

    adminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ============================================================
// INDEXES
// ============================================================

// orderNumber uniqueness index created automatically by { unique: true } on the field


orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
});

orderSchema.index({
  "customerInformation.phone": 1,
});

orderSchema.index({
  "customerInformation.email": 1,
});

orderSchema.index({
  createdAt: -1,
});

// ============================================================
// PRE-SAVE
// ============================================================

orderSchema.pre("save", function (next) {
  // ----------------------------------------------------------
  // Calculate line totals
  // ----------------------------------------------------------

  for (const item of this.items) {
    item.lineTotal = Number(
      (item.price * item.quantity).toFixed(2)
    );
  }

  // ----------------------------------------------------------
  // Calculate subtotal from order items
  // ----------------------------------------------------------

  const calculatedSubtotal = this.items.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  this.subtotal = Number(
    calculatedSubtotal.toFixed(2)
  );

  // ----------------------------------------------------------
  // Calculate final total
  // ----------------------------------------------------------

  const calculatedTotal =
    this.subtotal +
    this.deliveryFee -
    this.discount;

  this.total = Number(
    Math.max(0, calculatedTotal).toFixed(2)
  );

  // ----------------------------------------------------------
  // Add status history when status changes
  // ----------------------------------------------------------

  if (this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      note: "Order created",
      changedAt: new Date(),
      changedBy: null,
    });
  } else if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      note: "",
      changedAt: new Date(),
      changedBy: null,
    });
  }

  next();
});

// ============================================================
// VIRTUAL: ITEM COUNT
// ============================================================

orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
});

// ============================================================
// VIRTUAL: IS CANCELLABLE
// ============================================================

orderSchema.virtual("isCancellable").get(function () {
  return [
    "pending",
    "confirmed",
    "processing",
  ].includes(this.orderStatus);
});

// ============================================================
// VIRTUAL: IS COMPLETED
// ============================================================

orderSchema.virtual("isCompleted").get(function () {
  return this.orderStatus === "delivered";
});

// ============================================================
// VIRTUAL: IS PAID
// ============================================================

orderSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid";
});

// ============================================================
// VIRTUAL: DELIVERY STATUS
// ============================================================

orderSchema.virtual("isShipped").get(function () {
  return [
    "shipped",
    "out_for_delivery",
    "delivered",
  ].includes(this.orderStatus);
});

// ============================================================
// STATIC: FIND CUSTOMER ORDERS
// ============================================================

orderSchema.statics.findByUser = function (userId) {
  return this.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

// ============================================================
// STATIC: FIND PENDING ORDERS
// ============================================================

orderSchema.statics.findPending = function () {
  return this.find({
    orderStatus: "pending",
  }).sort({
    createdAt: 1,
  });
};

// ============================================================
// STATIC: FIND ACTIVE ORDERS
// ============================================================

orderSchema.statics.findActiveOrders = function () {
  return this.find({
    orderStatus: {
      $nin: [
        "delivered",
        "cancelled",
        "refunded",
      ],
    },
  }).sort({
    createdAt: -1,
  });
};

// ============================================================
// EXPORT MODEL
// ============================================================

const Order = mongoose.model("Order", orderSchema);

// Export model
module.exports = Order;

// Export enums for controllers/routes
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.DELIVERY_TYPES = DELIVERY_TYPES;