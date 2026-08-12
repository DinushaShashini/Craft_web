const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

// ─── Validation rules ──────────────────────────────────────────
const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 60 }),
];

// ─── Public routes ─────────────────────────────────────────────
router.get('/',    getCategories);
router.get('/:id', getCategoryById);

// ─── Admin-only routes ─────────────────────────────────────────
router.post('/',    protect, isAdmin, categoryRules, createCategory);
router.put('/:id',  protect, isAdmin, categoryRules, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;
