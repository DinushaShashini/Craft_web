const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const doc = cat.toObject();
      await cat.populate('count');
      doc.count = cat.count ?? 0;
      doc.id = doc.slug;
      return doc;
    })
  );

  res.json({
    success: true,
    count: withCounts.length,
    data: withCounts,
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
