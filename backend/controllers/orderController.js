const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    let total = 0;

    // Validate stock and calculate total
    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ msg: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }
      total += product.price * item.quantity;
    }

    const order = new Order({
      userId: req.user.id,
      products: products.map(p => ({ productId: p.productId, quantity: p.quantity })),
      totalAmount: total
    });
    await order.save();

    // Decrement stock for each product
    for (let item of products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('products.productId') 
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
};