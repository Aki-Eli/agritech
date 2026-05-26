/**
 * Utility helpers for JWT token generation.
 * Centralises token creation so the secret and expiry are defined in one place.
 */
const jwt = require('jsonwebtoken');

/**
 * Signs and returns a JWT for the given user.
 * @param {{ id: string, role: string }} user
 * @returns {string} signed JWT
 */
const generateToken = (user) => {
  const payload = { id: user.id || user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { generateToken };
