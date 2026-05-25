const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Crop = require('../models/Crop');
const ForumPost = require('../models/ForumPost');
const Alert = require('../models/Alert');

// ========== USER MANAGEMENT ==========
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { approved: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { banned: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { banned: false }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== SUPPORT REQUESTS ==========
// Add a support model
const SupportTicket = require('../models/SupportTicket');

exports.getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate('userId', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.respondToTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { response: req.body.response, status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== CONTENT MANAGEMENT ==========
exports.getAllCropsForAdmin = async (req, res) => {
  try {
    const crops = await Crop.find().populate('farmId', 'name');
    res.json(crops);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateCropInfo = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteCropAdmin = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== RESOURCE MANAGEMENT (Inventory) ==========
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== SERVICE MANAGEMENT (Bookings) ==========
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== SYSTEM MAINTENANCE & SECURITY ==========
exports.getSystemLogs = async (req, res) => {
  // In a real app, you'd have a Log model. Here we return recent user actions.
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    res.json({
      status: 'System operational',
      uptime: process.uptime(),
      recentUsers,
      recentOrders,
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.runMaintenance = async (req, res) => {
  // Example: cleanup old data, etc.
  try {
    // Delete old alerts (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Alert.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    res.json({ msg: 'Maintenance completed: old alerts removed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== DATA ANALYTICS ==========
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ approved: true });
    const totalFarms = await require('../models/Farm').countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const alertsCount = await Alert.countDocuments({ implemented: false });

    // Monthly orders for chart
    const monthlyOrders = await Order.aggregate([
      { $group: { _id: { $month: "$orderDate" }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalUsers,
      approvedUsers,
      totalFarms,
      totalCrops,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalBookings,
      pendingBookings,
      alertsCount,
      monthlyOrders
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== POLICY ENFORCEMENT ==========
exports.getReportedContent = async (req, res) => {
  // In production, you'd have a ReportedContent model. For now, fetch flagged forum posts.
  const flaggedPosts = await ForumPost.find({ flagged: true }).populate('userId', 'name');
  res.json(flaggedPosts);
};

exports.flagContent = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;
    if (!contentType || !contentId) return res.status(400).json({ msg: 'contentType and contentId are required' });
    if (contentType === 'forumPost') {
      const post = await ForumPost.findByIdAndUpdate(
        contentId,
        { flagged: true, flagReason: reason || 'Flagged by admin' },
        { new: true }
      );
      if (!post) return res.status(404).json({ msg: 'Post not found' });
      return res.json({ msg: 'Post flagged successfully', post });
    }
    res.status(400).json({ msg: 'Unsupported contentType' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteViolatingContent = async (req, res) => {
  const { contentType, contentId } = req.body;
  if (contentType === 'forumPost') {
    await ForumPost.findByIdAndDelete(contentId);
  }
  res.json({ msg: 'Content deleted' });
};

// ========== ADMIN BROADCAST PEST ALERT ==========
exports.broadcastAlert = async (req, res) => {
  try {
    const { pestName, description, severity, preventiveMeasures, treatment } = req.body;
    if (!pestName || !description) return res.status(400).json({ msg: 'pestName and description are required' });

    const farmers = await User.find({ role: 'farmer', approved: true });
    if (farmers.length === 0) return res.json({ msg: 'No approved farmers to notify' });

    const alerts = farmers.map(farmer => ({
      userId: farmer._id,
      type: pestName,
      message: description,
      severity: severity || 'high',
      preventiveMeasures: preventiveMeasures || 'Regular scouting, crop rotation, remove infected plants.',
      treatment: treatment || 'Apply recommended pesticide or organic solution.',
      isRead: false,
      implemented: false,
      createdAt: new Date()
    }));

    await Alert.insertMany(alerts);
    res.json({ msg: `Alert broadcast to ${farmers.length} farmers` });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== FARMER ANALYTICS ==========
exports.getFarmerAnalytics = async (req, res) => {
  try {
    const Farm = require('../models/Farm');
    const FarmActivity = require('../models/FarmActivity');
    const SoilHealth = require('../models/SoilHealth');

    // Get all farms for this farmer
    const farms = await Farm.find({ userId: req.user.id });
    const farmIds = farms.map(f => f._id);

    // Crops summary
    const allCrops = await Crop.find({ farmId: { $in: farmIds } });
    const activeCrops = allCrops.filter(c => !c.harvested);
    const harvestedCrops = allCrops.filter(c => c.harvested);

    // Crops by growth stage
    const stageCounts = { Germination: 0, Vegetative: 0, Flowering: 0, Harvest: 0 };
    activeCrops.forEach(c => { if (stageCounts[c.growthStage] !== undefined) stageCounts[c.growthStage]++; });

    // Activities summary
    const activities = await FarmActivity.find({ farmId: { $in: farmIds } }).sort({ date: -1 });
    const activityTypeCounts = {};
    activities.forEach(a => { activityTypeCounts[a.type] = (activityTypeCounts[a.type] || 0) + 1; });

    // Orders summary
    const orders = await Order.find({ userId: req.user.id }).sort({ orderDate: -1 });
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Monthly activity trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentActivities = activities.filter(a => new Date(a.date) >= sixMonthsAgo);
    const monthlyActivity = {};
    recentActivities.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });
    const activityTrend = Object.entries(monthlyActivity).map(([month, count]) => ({ month, count }));

    // Soil health latest per crop
    const soilRecords = await SoilHealth.find({ farmId: { $in: farmIds } }).sort({ date: -1 }).limit(10);

    // Alerts
    const alerts = await Alert.find({ userId: req.user.id });
    const pendingAlerts = alerts.filter(a => !a.implemented).length;

    res.json({
      totalFarms: farms.length,
      activeCrops: activeCrops.length,
      harvestedCrops: harvestedCrops.length,
      totalActivities: activities.length,
      stageCounts,
      activityTypeCounts,
      totalOrders: orders.length,
      totalSpent,
      pendingAlerts,
      activityTrend,
      recentSoilRecords: soilRecords,
      recentOrders: orders.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId')
      .sort({ orderDate: -1, createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};