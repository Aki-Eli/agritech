/**
 * Admin authorization middleware.
 * Must be used AFTER the auth middleware so req.user is already populated.
 */
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  next();
};
