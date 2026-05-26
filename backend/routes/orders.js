const express = require('express');
const { createOrder, getUserOrders, updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.post('/', auth, createOrder);
router.get('/me', auth, getUserOrders);
router.put('/:id', [auth, admin], updateOrderStatus);

module.exports = router;