const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    longDescription: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    materials: {
      type: [String],
      default: [],
    },
    dimensions: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1, isBestseller: 1, isNew: 1 });

module.exports = mongoose.model('Product', productSchema);
