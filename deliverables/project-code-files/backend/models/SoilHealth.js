const mongoose = require('mongoose');

const SoilHealthSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  date: Date,
  moisture: Number, // %
  ph: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  recommendations: String,
});

module.exports = mongoose.model('SoilHealth', SoilHealthSchema);