const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  // Populate the 'productCount' virtual (defined in Category model)
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('productCount');

  const data = categories.map((cat) => {
    const doc = cat.toObject({ virtuals: true });
    doc.id    = doc.slug;
    doc.count = typeof cat.productCount === 'number' ? cat.productCount : 0;
    return doc;
  });

  res.json({
    success: true,
    count: data.length,
    data,
  });
});


const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  const doc = category.toObject();
  doc.id = doc.slug;

  res.status(201).json({
    success: true,
    message: 'Category created.',
    data: doc,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  const doc = category.toObject();
  doc.id = doc.slug;

  res.json({
    success: true,
    message: 'Category updated.',
    data: doc,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  res.json({
    success: true,
    message: 'Category deleted.',
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
