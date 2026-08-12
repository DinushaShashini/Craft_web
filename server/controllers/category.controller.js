const { validationResult } = require('express-validator');
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
// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
// ─────────────────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('sortOrder name')
      .lean();

    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getCategoryById = async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;

    // Try by MongoDB _id first, then by slug
    const category = await Category.findOne({
      $or: [{ _id: idOrSlug.match(/^[a-f\d]{24}$/i) ? idOrSlug : null }, { slug: idOrSlug }],
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create category
// @route   POST /api/categories
// @access  Admin
// ─────────────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────
const updateCategory = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, message: 'Category updated.', category });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete (soft) category
// @route   DELETE /api/categories/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, message: 'Category removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
