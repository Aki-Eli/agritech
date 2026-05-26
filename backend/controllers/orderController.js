/**
 * Order controller.
 * Handles order creation with stock validation and user order retrieval.
 */
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * POST /api/orders
 * Creates a new order. Validates stock availability and calculates the total.
 * Decrements product stock after a successful order.
 */
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: 'Order must include at least one product' });
    }

    let total = 0;

    // Validate stock and calculate total before creating the order
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ msg: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          msg: `Insufficient stock for "${product.name}". Available: ${product.stock}`
        });
      }
      total += product.price * item.quantity;
    }

    const order = new Order({
      userId: req.user.id,
      products: products.map(p => ({ productId: p.productId, quantity: p.quantity })),
      totalAmount: total
    });
    await order.save();

    // Decrement stock for each ordered product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/orders/me
 * Returns all orders placed by the authenticated user, newest first.
 */
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('products.productId')
      .sort({ orderDate: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error('getUserOrders error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/orders/:id/status
 * Updates the status of an order (admin use).
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('updateOrderStatus error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
