const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  size: Number,
  location: String,
  irrigationMethod: String,
  soilType: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farm', FarmSchema);