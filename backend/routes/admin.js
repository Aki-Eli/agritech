const express = require('express');
const {
  getAllUsers, approveUser, banUser, unbanUser, deleteUser,
  getSupportTickets, respondToTicket,
  getAllCropsForAdmin, updateCropInfo, deleteCropAdmin,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllBookings, updateBookingStatus,
  getSystemLogs, runMaintenance,
  getAnalytics,
  getReportedContent, flagContent, deleteViolatingContent, getAllOrders, updateOrderStatus,
  broadcastAlert, getFarmerAnalytics
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


const router = express.Router();

// User Management
router.get('/users', auth, admin, getAllUsers);
router.put('/approve/:userId', auth, admin, approveUser);
router.put('/ban/:userId', auth, admin, banUser);
router.put('/unban/:userId', auth, admin, unbanUser);
router.delete('/user/:userId', auth, admin, deleteUser);
router.get('/orders', auth, admin, getAllOrders);
router.put('/order/:id', auth, admin, updateOrderStatus);

// Support
router.get('/tickets', auth, admin, getSupportTickets);
router.post('/ticket/:id/respond', auth, admin, respondToTicket);

// Content Management (crops)
router.get('/crops', auth, admin, getAllCropsForAdmin);
router.put('/crop/:id', auth, admin, updateCropInfo);
router.delete('/crop/:id', auth, admin, deleteCropAdmin);

// Resource Management (products)
router.get('/products', auth, admin, getAllProducts);
router.post('/products', auth, admin, createProduct);
router.put('/products/:id', auth, admin, updateProduct);
router.delete('/products/:id', auth, admin, deleteProduct);

// Service Management (bookings)
router.get('/bookings', auth, admin, getAllBookings);
router.put('/booking/:id', auth, admin, updateBookingStatus);

// System Maintenance
router.get('/logs', auth, admin, getSystemLogs);
router.post('/maintenance', auth, admin, runMaintenance);

// Analytics
router.get('/analytics', auth, admin, getAnalytics);
router.get('/farmer-analytics', auth, getFarmerAnalytics);

// Pest Alert Broadcast (admin only)
router.post('/broadcast-alert', auth, admin, broadcastAlert);

// Policy Enforcement
router.get('/reported-content', auth, admin, getReportedContent);
router.post('/flag-content', auth, admin, flagContent);
router.delete('/violating-content', auth, admin, deleteViolatingContent);

module.exports = router;