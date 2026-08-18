const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: '📦',
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#2563EB',
    },
    bgColor: {
      type: String,
      default: '#EFF6FF',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual('count', {
  ref: 'Product',
  localField: 'slug',
  foreignField: 'category',
  count: true,
});

module.exports = mongoose.model('Category', categorySchema);
