const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ============================================================
// ADDRESS SUB-DOCUMENT
// ============================================================

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Home",
      trim: true,
      maxlength: 40,
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    addressLine: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    district: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    province: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // Basic Information
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^[0-9+\-\s()]{7,20}$/,
        "Please provide a valid phone number",
      ],
    },

    // ----------------------------------------------------------
    // Password
    // ----------------------------------------------------------

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],

      // Password will not be returned in normal queries
      select: false,
    },

    // ----------------------------------------------------------
    // USER ROLE
    // ----------------------------------------------------------
    // This is important for the IMO Craft Admin Panel.
    //
    // customer -> normal website user
    // admin    -> can access Admin Dashboard
    // ----------------------------------------------------------

    role: {
      type: String,

      enum: {
        values: ["customer", "admin"],
        message: "Role must be customer or admin",
      },

      default: "customer",
    },

    // ----------------------------------------------------------
    // Address Book
    // ----------------------------------------------------------

    address: {
      type: [addressSchema],

      validate: [
        {
          validator: (value) => value.length <= 5,
          message: "Maximum 5 saved addresses allowed",
        },
      ],

      default: [],
    },

    // ----------------------------------------------------------
    // Account Status
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------------------------
    // Wishlist
    // ----------------------------------------------------------

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ----------------------------------------------------------
    // Password Reset
    // ----------------------------------------------------------

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
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

// email uniqueness index is created automatically by { unique: true } on the field
// role index for admin lookups
userSchema.index({ role: 1, isActive: 1 });

// ============================================================
// PRE-SAVE PASSWORD HASHING
// ============================================================

userSchema.pre("save", async function (next) {
  // If password has not changed, don't hash again
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// COMPARE PASSWORD
// ============================================================

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================
// CHECK ADMIN
// ============================================================

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// ============================================================
// CHECK CUSTOMER
// ============================================================

userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

// ============================================================
// REMOVE SENSITIVE DATA FROM JSON
// ============================================================

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  // Never send password to frontend
  delete obj.password;

  // Never send password reset information
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  // Remove mongoose internal version field
  delete obj.__v;

  return obj;
};

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model("User", userSchema);