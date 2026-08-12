const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require('../controllers/product.controller');

// ─── Validation rules ──────────────────────────────────────────
const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

// ─── Public routes ─────────────────────────────────────────────
router.get('/',    getProducts);
router.get('/:id', getProductById);

// ─── Admin-only routes ─────────────────────────────────────────
router.post('/',    protect, isAdmin, productRules, createProduct);
router.put('/:id',  protect, isAdmin, productRules, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

// ─── Authenticated customer routes ────────────────────────────
router.post('/:id/reviews', protect, reviewRules, addReview);

module.exports = router;
