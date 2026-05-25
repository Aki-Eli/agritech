const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceType: String,
  details: String,
  scheduledDate: Date,
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Booking', BookingSchema);