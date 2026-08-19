const mongoose = require("mongoose");

// ============================================================
// CATEGORY SCHEMA
// ============================================================

const categorySchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // Category Name
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    // ----------------------------------------------------------
    // URL Slug
    // Example:
    // "Craft Bouquets" -> "craft-bouquets"
    // ----------------------------------------------------------

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,

      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },

    // ----------------------------------------------------------
    // Description
    // ----------------------------------------------------------

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        500,
        "Description cannot exceed 500 characters",
      ],
    },

    // ----------------------------------------------------------
    // Category Image
    // ----------------------------------------------------------

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // ----------------------------------------------------------
    // Icon
    // Example: "🎁", "🌸", "🔑"
    // ----------------------------------------------------------

    icon: {
      type: String,
      default: "📦",
      trim: true,
      maxlength: 10,
    },

    // ----------------------------------------------------------
    // Category Colors
    // ----------------------------------------------------------

    color: {
      type: String,
      default: "#C9785A",
      trim: true,

      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Color must be a valid HEX color",
      ],
    },

    bgColor: {
      type: String,
      default: "#FFF7ED",
      trim: true,

      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Background color must be a valid HEX color",
      ],
    },

    // ----------------------------------------------------------
    // Active / Inactive
    // ----------------------------------------------------------
    // Admin can deactivate a category without deleting it.
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------------------------
    // Display Order
    // ----------------------------------------------------------

    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "Sort order cannot be negative"],
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

// slug uniqueness index created automatically by { unique: true } on the field
categorySchema.index({ isActive: 1, sortOrder: 1 });

// ============================================================
// VIRTUAL: PRODUCT COUNT
// ============================================================
// This allows us to count how many products belong to a category.
//
// Example:
// Keychains → 12 products
// Bouquets  → 8 products
// Gifts     → 15 products
// ============================================================

categorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// ============================================================
// AUTO-GENERATE SLUG
// ============================================================
// If admin enters:
//
// "Craft Bouquets"
//
// slug becomes:
//
// "craft-bouquets"
// ============================================================

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  next();
});

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model("Category", categorySchema);