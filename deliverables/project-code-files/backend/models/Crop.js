const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  type: { type: String, required: true },
  plantingDate: Date,
  growthStage: { type: String, enum: ['Germination', 'Vegetative', 'Flowering', 'Harvest'], default: 'Germination' },
  soilMoisture: Number,
  soilNutrients: Number,
  recommendations: String,
  harvested: { type: Boolean, default: false },
  harvestDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', CropSchema);