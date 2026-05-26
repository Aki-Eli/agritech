const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true }, // e.g. "Soil Science", "Pest Management"
  bio: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  phone: { type: String, default: '' },
  available: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expert', ExpertSchema);
