const mongoose = require('mongoose');

const FarmActivitySchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  type: { type: String, enum: ['planting', 'fertilizing', 'harvesting', 'irrigation'] },
  cropType: String,
  date: Date,
  quantity: Number, // seeds kg, fertilizer kg, etc.
  notes: String,
});

module.exports = mongoose.model('FarmActivity', FarmActivitySchema);