const express = require('express');
const { createBooking, getUserBookings, updateBookingStatus } = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.post('/', auth, createBooking);
router.get('/me', auth, getUserBookings);
router.put('/:id', [auth, admin], updateBookingStatus);

module.exports = router;