/**
 * User model.
 * Passwords are hashed automatically via a pre-save hook — never store plain text.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  approved: { type: Boolean, default: false },
  banned:   { type: Boolean, default: false },
  farmId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  createdAt:{ type: Date, default: Date.now }
});

/**
 * Hash the password before saving whenever it has been modified.
 * This removes the need to manually call bcrypt in every controller.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Convenience method to compare a plain-text password against the stored hash.
 * @param {string} plainPassword
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
