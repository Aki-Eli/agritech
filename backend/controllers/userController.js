const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Self-service profile update — any authenticated user can update their own profile
exports.updateProfile = async (req, res) => {
  try {
    // Only allow updating own account
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this account' });
    }

    const { name, email, password } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();

    if (email && email.trim()) {
      // Check email not already taken by someone else
      const existing = await User.findOne({ email: email.trim(), _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ msg: 'Email is already in use by another account' });
      updates.email = email.trim();
    }

    if (password) {
      if (password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ msg: 'No changes provided' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Self-service account deletion — any authenticated user can delete their own account
exports.deleteOwnAccount = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin-only: update any user
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(user);
};

// Admin-only: delete any user
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'User deleted' });
};