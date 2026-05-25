const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Determine approval:
    // - Farmers always start unapproved (need admin approval)
    // - First admin ever is auto-approved (bootstrapping)
    // - Any subsequent admin requires approval from an existing admin
    let approved = false;
    if (role === 'admin') {
      const existingAdminCount = await User.countDocuments({ role: 'admin' });
      approved = existingAdminCount === 0; // only auto-approve the very first admin
    }

    user = new User({ name, email, password: hashed, role: role || 'farmer', approved });
    await user.save();

    // If not approved, return info without a token so they can't log in yet
    if (!approved) {
      return res.status(201).json({
        msg: role === 'admin'
          ? 'Admin account created. An existing admin must approve your account before you can log in.'
          : 'Account created. An admin must approve your account before you can log in.',
        approved: false
      });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name, email, role: user.role, approved: user.approved } });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check banned before approved — gives a clearer message
    if (user.banned) {
      return res.status(403).json({
        msg: 'Your account has been suspended.',
        banned: true
      });
    }

    if (!user.approved) {
      return res.status(401).json({
        msg: 'Account not approved by admin. Please wait for an admin to approve your account.'
      });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};