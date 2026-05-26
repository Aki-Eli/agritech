/**
 * Authentication middleware.
 * Verifies the JWT from the Authorization header (Bearer token),
 * then performs a live DB check to enforce real-time bans.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // Support both "Authorization: Bearer <token>" and legacy "x-auth-token" header
  let token = null;
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Live DB check: enforce bans that happened after the token was issued
    const user = await User.findById(decoded.id).select('banned approved').lean();
    if (!user) return res.status(401).json({ msg: 'User no longer exists' });
    if (user.banned) {
      return res.status(403).json({ msg: 'Your account has been suspended.', banned: true });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
