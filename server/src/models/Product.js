const mongoose = require("mongoose");

// ============================================================
// RATING SUMMARY SUB-DOCUMENT
// ============================================================

const ratingSummarySchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    count: {
      type: Number,
      default: 0,
      min: 0,
    },

    distribution: {
      1: {
        type: Number,
        default: 0,
        min: 0,
      },

      2: {
        type: Number,
        default: 0,
        min: 0,
      },

      3: {
        type: Number,
        default: 0,
        min: 0,
      },

      4: {
        type: Number,
        default: 0,
        min: 0,
      },

      5: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// PRODUCT SCHEMA
// ============================================================

const productSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // PRODUCT NAME
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },

    // ----------------------------------------------------------
    // SHORT DESCRIPTION
    // ----------------------------------------------------------

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
    },

    // ----------------------------------------------------------
    // LONG DESCRIPTION
    // ----------------------------------------------------------

    longDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        10000,
        "Long description cannot exceed 10000 characters",
      ],
    },

    // ----------------------------------------------------------
    // PRICE
    // ----------------------------------------------------------

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // ----------------------------------------------------------
    // ORIGINAL PRICE
    // Used for showing discounts.
    //
    // Example:
    // originalPrice = 600
    // price = 450
    //
    // Frontend can show:
    // Rs. 600  ->  Rs. 450
    // ----------------------------------------------------------

    originalPrice: {
      type: Number,
      default: null,
      min: [0, "Original price cannot be negative"],
      validate: {
        validator: function (value) {
          if (value === null || value === undefined) {
            return true;
          }

          return value >= this.price;
        },

        message:
          "Original price must be greater than or equal to the current price",
      },
    },

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // ----------------------------------------------------------
    // CATEGORY SLUG
    // Denormalized for faster filtering.
    //
    // Example:
    // categorySlug = "keychains"
    // ----------------------------------------------------------

    categorySlug: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // ----------------------------------------------------------
    // PRODUCT IMAGES
    // ----------------------------------------------------------

    images: {
      type: [String],

      validate: [
        {
          validator: (value) => value.length <= 10,
          message: "Maximum 10 images per product",
        },

        {
          validator: (value) =>
            value.every(
              (image) =>
                typeof image === "string" &&
                image.trim().length > 0
            ),

          message: "Product images must contain valid image paths or URLs",
        },
      ],

      default: [],
    },

    // ----------------------------------------------------------
    // STOCK
    // ----------------------------------------------------------

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    // ----------------------------------------------------------
    // CUSTOMIZATION
    // ----------------------------------------------------------

    customizable: {
      type: Boolean,
      default: false,
    },

    // Example:
    //
    // [
    //   "name",
    //   "letter",
    //   "color",
    //   "special_request"
    // ]
    //
    // Only used when customizable = true.

    customizationFields: {
      type: [String],
      default: [],

      validate: {
        validator: (fields) =>
          fields.every(
            (field) =>
              typeof field === "string" &&
              field.trim().length > 0
          ),

        message: "Customization fields must be valid strings",
      },
    },

    // ----------------------------------------------------------
    // FEATURED PRODUCT
    // ----------------------------------------------------------

    featured: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------------
    // BESTSELLER
    // ----------------------------------------------------------

    isBestseller: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------------
    // NEW PRODUCT
    // ----------------------------------------------------------

    isNew: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------------
    // ACTIVE / INACTIVE
    // ----------------------------------------------------------
    // Admin can deactivate a product without deleting it.
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------------------------
    // RATING
    // ----------------------------------------------------------

    rating: {
      type: ratingSummarySchema,
      default: () => ({}),
    },

    // ----------------------------------------------------------
    // TAGS
    // ----------------------------------------------------------

    tags: {
      type: [String],
      default: [],
    },

    // ----------------------------------------------------------
    // MATERIALS
    // ----------------------------------------------------------

    materials: {
      type: [String],
      default: [],
    },

    // ----------------------------------------------------------
    // DIMENSIONS
    // ----------------------------------------------------------

    dimensions: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ----------------------------------------------------------
    // WEIGHT
    // ----------------------------------------------------------

    weight: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
  },

  {
    timestamps: true,
    suppressReservedKeysWarning: true,  // silence isNew reserved key warning

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

productSchema.index({
  category: 1,
  isActive: 1,
});

productSchema.index({
  categorySlug: 1,
});

productSchema.index({
  featured: 1,
  isBestseller: 1,
  isNew: 1,
});

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

productSchema.index({
  price: 1,
});

productSchema.index({
  "rating.average": -1,
});

productSchema.index({
  createdAt: -1,
});

// ============================================================
// VIRTUAL: IN STOCK
// ============================================================

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ============================================================
// VIRTUAL: DISCOUNT PERCENTAGE
// ============================================================

productSchema.virtual("discountPercentage").get(function () {
  if (
    !this.originalPrice ||
    this.originalPrice <= this.price
  ) {
    return 0;
  }

  return Math.round(
    ((this.originalPrice - this.price) /
      this.originalPrice) *
      100
  );
});

// ============================================================
// VIRTUAL: REVIEWS
// ============================================================

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

// ============================================================
// PRE-VALIDATE
// ============================================================
// Automatically get category slug from Category.
//
// Example:
// Category name = "Craft Bouquets"
// Category slug = "craft-bouquets"
//
// Product will store:
// categorySlug = "craft-bouquets"
// ============================================================

productSchema.pre("validate", async function (next) {
  try {
    if (
      this.category &&
      (!this.categorySlug || this.isModified("category"))
    ) {
      const Category = mongoose.model("Category");

      const category = await Category.findById(this.category).select(
        "slug"
      );

      if (category) {
        this.categorySlug = category.slug;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PRE-VALIDATE CUSTOMIZATION
// ============================================================

productSchema.pre("validate", function (next) {
  // If product is not customizable,
  // remove customization fields.

  if (!this.customizable) {
    this.customizationFields = [];
  }

  next();
});

// ============================================================
// STATIC: RECALCULATE RATING
// ============================================================

productSchema.statics.recalculateRating = async function (
  productId
) {
  const Review = mongoose.model("Review");

  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),

        // Only count visible reviews
        isVisible: true,
      },
    },

    {
      $group: {
        _id: "$product",

        average: {
          $avg: "$rating",
        },

        count: {
          $sum: 1,
        },

        dist1: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 1],
              },
              1,
              0,
            ],
          },
        },

        dist2: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 2],
              },
              1,
              0,
            ],
          },
        },

        dist3: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 3],
              },
              1,
              0,
            ],
          },
        },

        dist4: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 4],
              },
              1,
              0,
            ],
          },
        },

        dist5: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 5],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // ----------------------------------------------------------
  // No reviews
  // ----------------------------------------------------------

  if (stats.length === 0) {
    await this.findByIdAndUpdate(productId, {
      rating: {
        average: 0,
        count: 0,

        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      },
    });

    return;
  }

  // ----------------------------------------------------------
  // Update rating summary
  // ----------------------------------------------------------

  const result = stats[0];

  await this.findByIdAndUpdate(productId, {
    rating: {
      average: Math.round(result.average * 10) / 10,

      count: result.count,

      distribution: {
        1: result.dist1,
        2: result.dist2,
        3: result.dist3,
        4: result.dist4,
        5: result.dist5,
      },
    },
  });
};

// ============================================================
// STATIC: FIND ACTIVE PRODUCTS
// ============================================================

productSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
  })
    .populate("category", "name slug")
    .sort({
      createdAt: -1,
    });
};

// ============================================================
// STATIC: FIND FEATURED PRODUCTS
// ============================================================

productSchema.statics.findFeatured = function () {
  return this.find({
    isActive: true,
    featured: true,
  })
    .populate("category", "name slug")
    .sort({
      createdAt: -1,
    });
};

// ============================================================
// STATIC: FIND BESTSELLERS
// ============================================================

productSchema.statics.findBestsellers = function () {
  return this.find({
    isActive: true,
    isBestseller: true,
  })
    .populate("category", "name slug")
    .sort({
      "rating.average": -1,
    });
};

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model("Product", productSchema);