/**
 * Admin controller.
 * All functions here require both auth + admin middleware (enforced at the route level),
 * except getFarmerAnalytics which only requires auth (farmers call it too).
 */
const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const FarmActivity = require('../models/FarmActivity');
const SoilHealth = require('../models/SoilHealth');
const ForumPost = require('../models/ForumPost');
const Alert = require('../models/Alert');
const SupportTicket = require('../models/SupportTicket');

// Fields admin is allowed to set when updating a user
const USER_UPDATE_FIELDS = ['name', 'email', 'role', 'approved', 'banned'];

// ═══════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/users
 * Returns all users without password hashes.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error('admin.getAllUsers error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/admin/approve/:userId
 * Approves a pending user account.
 */
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { approved: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('admin.approveUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/admin/ban/:userId
 * Bans a user account. The auth middleware will enforce this on their next request.
 */
exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { banned: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('admin.banUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/admin/unban/:userId
 * Lifts a ban from a user account.
 */
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { banned: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('admin.unbanUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/admin/user/:userId
 * Permanently deletes a user account.
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('admin.deleteUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/tickets
 * Returns all support tickets with the submitting user's name and email.
 */
exports.getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(tickets);
  } catch (err) {
    console.error('admin.getSupportTickets error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/admin/ticket/:id/respond
 * Records an admin response and marks the ticket as resolved.
 */
exports.respondToTicket = async (req, res) => {
  try {
    if (!req.body.response) {
      return res.status(400).json({ msg: 'Response text is required' });
    }
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { response: req.body.response, status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error('admin.respondToTicket error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// CONTENT MANAGEMENT (Crops)
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/crops
 * Returns all crop records with their associated farm name.
 */
exports.getAllCropsForAdmin = async (req, res) => {
  try {
    const crops = await Crop.find().populate('farmId', 'name').lean();
    res.json(crops);
  } catch (err) {
    console.error('admin.getAllCropsForAdmin error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/admin/crop/:id
 * Updates a crop record.
 */
exports.updateCropInfo = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    console.error('admin.updateCropInfo error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/admin/crop/:id
 * Deletes a crop record.
 */
exports.deleteCropAdmin = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    res.json({ msg: 'Crop deleted successfully' });
  } catch (err) {
    console.error('admin.deleteCropAdmin error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// RESOURCE MANAGEMENT (Products)
// ═══════════════════════════════════════════════

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error('admin.getAllProducts error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('admin.createProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('admin.updateProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('admin.deleteProduct error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// SERVICE MANAGEMENT (Bookings)
// ═══════════════════════════════════════════════

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('admin.getAllBookings error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('admin.updateBookingStatus error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId')
      .sort({ orderDate: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error('admin.getAllOrders error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
    console.error('admin.updateOrderStatus error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// SYSTEM MAINTENANCE
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/logs
 * Returns a snapshot of recent system activity (users, orders, bookings).
 */
exports.getSystemLogs = async (req, res) => {
  try {
    const [recentUsers, recentOrders, recentBookings] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).limit(10).lean(),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    res.json({
      status: 'System operational',
      uptime: process.uptime(),
      recentUsers,
      recentOrders,
      recentBookings
    });
  } catch (err) {
    console.error('admin.getSystemLogs error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/admin/maintenance
 * Runs routine cleanup tasks (e.g., removes alerts older than 30 days).
 */
exports.runMaintenance = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await Alert.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    res.json({ msg: `Maintenance completed: ${result.deletedCount} old alert(s) removed` });
  } catch (err) {
    console.error('admin.runMaintenance error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/analytics
 * Returns platform-wide statistics for the admin dashboard.
 */
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers, approvedUsers, totalFarms, totalCrops,
      totalOrders, totalRevenue, totalBookings, pendingBookings, alertsCount,
      monthlyOrders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ approved: true }),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Alert.countDocuments({ implemented: false }),
      Order.aggregate([
        { $group: { _id: { $month: '$orderDate' }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { '_id': 1 } }
      ])
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
    console.error('admin.getAnalytics error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// POLICY ENFORCEMENT (Forum)
// ═══════════════════════════════════════════════

exports.getReportedContent = async (req, res) => {
  try {
    const flaggedPosts = await ForumPost.find({ flagged: true })
      .populate('userId', 'name')
      .lean();
    res.json(flaggedPosts);
  } catch (err) {
    console.error('admin.getReportedContent error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.flagContent = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;
    if (!contentType || !contentId) {
      return res.status(400).json({ msg: 'contentType and contentId are required' });
    }
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
    console.error('admin.flagContent error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteViolatingContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    if (!contentType || !contentId) {
      return res.status(400).json({ msg: 'contentType and contentId are required' });
    }
    if (contentType === 'forumPost') {
      const post = await ForumPost.findByIdAndDelete(contentId);
      if (!post) return res.status(404).json({ msg: 'Post not found' });
    }
    res.json({ msg: 'Content deleted successfully' });
  } catch (err) {
    console.error('admin.deleteViolatingContent error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// PEST ALERT BROADCAST
// ═══════════════════════════════════════════════

/**
 * POST /api/admin/broadcast-alert
 * Sends a pest alert to all approved farmers.
 */
exports.broadcastAlert = async (req, res) => {
  try {
    const { pestName, description, severity, preventiveMeasures, treatment } = req.body;
    if (!pestName || !description) {
      return res.status(400).json({ msg: 'pestName and description are required' });
    }

    const farmers = await User.find({ role: 'farmer', approved: true }).lean();
    if (farmers.length === 0) {
      return res.json({ msg: 'No approved farmers to notify' });
    }

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
    res.json({ msg: `Alert broadcast to ${farmers.length} farmer(s)` });
  } catch (err) {
    console.error('admin.broadcastAlert error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// FARMER ANALYTICS (auth only — farmers call this)
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/farmer-analytics
 * Returns analytics data scoped to the authenticated farmer's own farms and activity.
 * Note: this endpoint is accessible to farmers (auth only, no admin check).
 */
exports.getFarmerAnalytics = async (req, res) => {
  try {
    // Fetch all farms belonging to this farmer
    const farms = await Farm.find({ userId: req.user.id }).lean();
    const farmIds = farms.map(f => f._id);

    // Crop summary
    const allCrops = await Crop.find({ farmId: { $in: farmIds } }).lean();
    const activeCrops = allCrops.filter(c => !c.harvested);
    const harvestedCrops = allCrops.filter(c => c.harvested);

    // Growth stage breakdown
    const stageCounts = { Germination: 0, Vegetative: 0, Flowering: 0, Harvest: 0 };
    activeCrops.forEach(c => {
      if (stageCounts[c.growthStage] !== undefined) stageCounts[c.growthStage]++;
    });

    // Activity summary
    const activities = await FarmActivity.find({ farmId: { $in: farmIds } })
      .sort({ date: -1 })
      .lean();
    const activityTypeCounts = {};
    activities.forEach(a => {
      activityTypeCounts[a.type] = (activityTypeCounts[a.type] || 0) + 1;
    });

    // Order summary
    const orders = await Order.find({ userId: req.user.id }).sort({ orderDate: -1 }).lean();
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Monthly activity trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentActivities = activities.filter(a => new Date(a.date) >= sixMonthsAgo);
    const monthlyActivity = {};
    recentActivities.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });
    const activityTrend = Object.entries(monthlyActivity).map(([month, count]) => ({ month, count }));

    // Soil health — latest 10 records across all farms
    const soilRecords = await SoilHealth.find({ farmId: { $in: farmIds } })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Pending alerts
    const alerts = await Alert.find({ userId: req.user.id }).lean();
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
    console.error('admin.getFarmerAnalytics error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
