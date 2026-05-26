/**
 * User controller.
 * Self-service profile management (any authenticated user) and
 * admin-only user management operations.
 */
const User = require('../models/User');

// Fields that admin is allowed to update on any user account
const ADMIN_ALLOWED_FIELDS = ['name', 'email', 'role', 'approved', 'banned'];

/**
 * GET /api/users
 * Admin only — returns all users without password hashes.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/users/profile/:id
 * Self-service — any authenticated user can update their own profile.
 * Validates input and hashes the new password via the User model pre-save hook.
 */
exports.updateProfile = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this account' });
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name && name.trim()) user.name = name.trim();

    if (email && email.trim()) {
      const emailLower = email.toLowerCase().trim();
      const existing = await User.findOne({ email: emailLower, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ msg: 'Email is already in use by another account' });
      user.email = emailLower;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
      }
      // Assigning triggers the pre-save hook to hash it automatically
      user.password = password;
    }

    await user.save();

    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/users/profile/:id
 * Self-service — any authenticated user can delete their own account.
 */
exports.deleteOwnAccount = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteOwnAccount error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/users/:id
 * Admin only — update any user's account.
 * Only whitelisted fields can be changed to prevent mass-assignment attacks.
 */
exports.updateUser = async (req, res) => {
  try {
    // Build an update object from only the allowed fields
    const updates = {};
    ADMIN_ALLOWED_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ msg: 'No valid fields provided for update' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('updateUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/users/:id
 * Admin only — delete any user account.
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
