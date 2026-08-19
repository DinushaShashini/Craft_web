const mongoose = require('mongoose');

// ============================================================
// REVIEW SCHEMA
// ============================================================

const reviewSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // Relationships
    // ----------------------------------------------------------

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // Optional order reference
    // Can be used to verify that the customer purchased the product
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // ----------------------------------------------------------
    // Review Content
    // ----------------------------------------------------------

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],

      // Rating must be a whole number
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number between 1 and 5',
      },
    },

    title: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Review title cannot exceed 100 characters',
      ],
      default: '',
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [
        10,
        'Comment must be at least 10 characters',
      ],
      maxlength: [
        1000,
        'Comment cannot exceed 1000 characters',
      ],
    },

    // Customer-uploaded review images
    images: {
      type: [String],
      default: [],

      validate: {
        validator: function (images) {
          return images.length <= 5;
        },
        message: 'Maximum 5 images per review',
      },
    },

    // ----------------------------------------------------------
    // Verification & Moderation
    // ----------------------------------------------------------

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------------------------
    // Helpful Votes
    // ----------------------------------------------------------

    helpfulVotes: {
      type: Number,
      default: 0,
      min: [0, 'Helpful votes cannot be negative'],
    },

    // Users who voted this review as helpful
    helpfulVotedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
      select: false,
    },

    // ----------------------------------------------------------
    // Admin Reply
    // ----------------------------------------------------------

    adminReply: {
      text: {
        type: String,
        trim: true,
        maxlength: [
          1000,
          'Admin reply cannot exceed 1000 characters',
        ],
        default: '',
      },

      repliedAt: {
        type: Date,
        default: null,
      },
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

// One review per user for each product
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true }
);

// Product reviews sorted by newest
reviewSchema.index({
  product: 1,
  isVisible: 1,
  createdAt: -1,
});

// User's reviews sorted by newest
reviewSchema.index({
  user: 1,
  createdAt: -1,
});

// Rating filtering/sorting
reviewSchema.index({
  rating: 1,
});

// Verified purchase reviews
reviewSchema.index({
  product: 1,
  isVerifiedPurchase: 1,
});

// ============================================================
// POST SAVE HOOK
// ============================================================

// Recalculate product rating whenever a review is created
// or updated.
reviewSchema.post('save', async function () {
  try {
    const Product = mongoose.model('Product');

    if (typeof Product.recalculateRating === 'function') {
      await Product.recalculateRating(this.product);
    }
  } catch (error) {
    console.error(
      'Error recalculating product rating after review save:',
      error.message
    );
  }
});

// ============================================================
// POST FIND ONE AND DELETE HOOK
// ============================================================

// Recalculate product rating after deleting a review
reviewSchema.post(
  'findOneAndDelete',
  async function (doc) {
    try {
      if (!doc) return;

      const Product = mongoose.model('Product');

      if (typeof Product.recalculateRating === 'function') {
        await Product.recalculateRating(doc.product);
      }
    } catch (error) {
      console.error(
        'Error recalculating product rating after review deletion:',
        error.message
      );
    }
  }
);

// ============================================================
// POST DELETE ONE HOOK
// ============================================================

// Recalculate product rating after deleteOne()
reviewSchema.post(
  'deleteOne',
  { document: false, query: true },
  async function () {
    try {
      const filter = this.getFilter();

      if (!filter.product) return;

      const Product = mongoose.model('Product');

      if (typeof Product.recalculateRating === 'function') {
        await Product.recalculateRating(filter.product);
      }
    } catch (error) {
      console.error(
        'Error recalculating product rating after deleteOne:',
        error.message
      );
    }
  }
);

// ============================================================
// MODEL
// ============================================================

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;