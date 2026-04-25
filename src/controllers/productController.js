const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/products
exports.listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: 1 });
  res.json(products);
});

// POST /api/products  (auth)
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    ingredients,
    isFeatured,
    isAvailable,
  } = req.body;

  if (!name || !description || !image) {
    return res
      .status(400)
      .json({ error: 'name, description, and image are required' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category: category || 'Mains',
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    isFeatured: Boolean(isFeatured),
    isAvailable: isAvailable !== false,
  });

  res.status(201).json(product);
});

// PATCH /api/products/:id  (auth)
exports.updateProduct = asyncHandler(async (req, res) => {
  const allowed = [
    'name',
    'description',
    'price',
    'image',
    'category',
    'ingredients',
    'isFeatured',
    'isAvailable',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  res.json(product);
});

// DELETE /api/products/:id  (auth)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});
