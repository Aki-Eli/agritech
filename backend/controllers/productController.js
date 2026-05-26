/**
 * Product controller.
 * Public read access; write operations are admin-only (enforced at the route level).
 */
const Product = require('../models/Product');

/**
 * GET /api/products
 * Returns all available products.
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error('getProducts error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/products
 * Admin only — creates a new product listing.
 */
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('createProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/products/:id
 * Admin only — updates an existing product.
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('updateProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/products/:id
 * Admin only — removes a product listing.
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('deleteProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
