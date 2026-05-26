/**
 * Booking controller.
 * Manages expert consultation bookings for authenticated farmers.
 */
const Booking = require('../models/Booking');

/**
 * POST /api/bookings
 * Creates a new booking for the authenticated user.
 */
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.user.id });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error('createBooking error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/bookings/me
 * Returns all bookings for the authenticated user.
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).lean();
    res.json(bookings);
  } catch (err) {
    console.error('getUserBookings error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/bookings/:id/status
 * Updates the status of a booking (admin use).
 */
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
    console.error('updateBookingStatus error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
