const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category.toLowerCase();
  }
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.bestseller === 'true') filter.isBestseller = true;
  if (req.query.isNew === 'true') filter.isNew = true;

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.json({
    success: true,
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created.',
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.json({
    success: true,
    message: 'Product updated.',
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.json({
    success: true,
    message: 'Product deleted.',
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
