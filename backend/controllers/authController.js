/**
 * Authentication controller.
 * Handles user registration, login, and session retrieval.
 */
const User = require('../models/User');
const { generateToken } = require('../utils/tokenHelper');

/**
 * POST /api/auth/register
 * Creates a new user account. Farmers require admin approval before they can log in.
 * The very first admin account is auto-approved to bootstrap the system.
 */
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ msg: 'An account with that email already exists' });

    // Determine approval status:
    // - Farmers always start unapproved (admin must approve)
    // - The very first admin is auto-approved to bootstrap the system
    // - Subsequent admins require approval from an existing admin
    let approved = false;
    const assignedRole = role === 'admin' ? 'admin' : 'farmer';
    if (assignedRole === 'admin') {
      const existingAdminCount = await User.countDocuments({ role: 'admin' });
      approved = existingAdminCount === 0;
    }

    // Password is hashed automatically by the User model's pre-save hook
    const user = new User({ name, email, password, role: assignedRole, approved });
    await user.save();

    if (!approved) {
      return res.status(201).json({
        msg: assignedRole === 'admin'
          ? 'Admin account created. An existing admin must approve your account before you can log in.'
          : 'Account created. An admin must approve your account before you can log in.',
        approved: false
      });
    }

    // Auto-approved (first admin): return a token so they can log in immediately
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT on success.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check banned before approved — gives a clearer error message
    if (user.banned) {
      return res.status(403).json({ msg: 'Your account has been suspended.', banned: true });
    }

    if (!user.approved) {
      return res.status(401).json({
        msg: 'Your account is pending admin approval. Please wait for an admin to approve your account.'
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile (no password).
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
