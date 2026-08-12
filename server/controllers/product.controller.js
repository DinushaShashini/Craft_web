const { validationResult } = require('express-validator');
const Product  = require('../models/Product.model');
const Category = require('../models/Category.model');

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all products (filter / sort / paginate / search)
// @route   GET /api/products
// @access  Public
// ─────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      isBestseller,
      isNew,
      customizable,
    } = req.query;

    // Build filter — only show active products publicly
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (isFeatured)   filter.isFeatured   = isFeatured === 'true';
    if (isBestseller) filter.isBestseller = isBestseller === 'true';
    if (isNew)        filter.isNew        = isNew === 'true';
    if (customizable) filter.customizable = customizable === 'true';

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Full-text search (requires text index on name + description + tags)
    let query;
    if (search) {
      query = Product.find({ ...filter, $text: { $search: search } });
    } else {
      query = Product.find(filter);
    }

    // Total count for pagination
    const total = await Product.countDocuments(
      search ? { ...filter, $text: { $search: search } } : filter
    );

    const products = await query
      .populate('category', 'name slug')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create product
// @route   POST /api/products
// @access  Admin
// ─────────────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    // Verify category exists
    const cat = await Category.findById(req.body.category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Category not found.' });
    }

    const product = await Product.create(req.body);
    await product.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Soft-delete product (set isActive = false)
// @route   DELETE /api/products/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, message: 'Product removed from catalogue.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private (logged-in customer)
// ─────────────────────────────────────────────────────────────
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // One review per user
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    product.reviews.push({
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment: comment || '',
    });

    product.updateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added.', product });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
