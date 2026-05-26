const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  message: String,
  severity: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  preventiveMeasures: String,
  treatment: String,
  implemented: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', AlertSchema);