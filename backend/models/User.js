const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  approved: { type: Boolean, default: false },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  createdAt: { type: Date, default: Date.now },
  banned: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);