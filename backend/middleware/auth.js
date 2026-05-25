const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if the user has been banned since the token was issued
    const user = await User.findById(decoded.id).select('banned approved');
    if (!user) return res.status(401).json({ msg: 'User no longer exists' });
    if (user.banned) return res.status(403).json({ msg: 'Your account has been suspended.', banned: true });

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
