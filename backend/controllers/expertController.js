/**
 * Expert controller.
 * Manages expert profiles available for consultation bookings.
 * Read access is open to all authenticated users; write operations are admin-only.
 */
const Expert = require('../models/Expert');

/**
 * GET /api/experts
 * Returns all expert profiles sorted alphabetically by name.
 */
exports.getExperts = async (req, res) => {
  try {
    const experts = await Expert.find().sort({ name: 1 }).lean();
    res.json(experts);
  } catch (err) {
    console.error('getExperts error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/experts
 * Admin only — creates a new expert profile.
 */
exports.createExpert = async (req, res) => {
  try {
    const expert = new Expert(req.body);
    await expert.save();
    res.status(201).json(expert);
  } catch (err) {
    console.error('createExpert error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/experts/:id
 * Admin only — updates an existing expert profile.
 */
exports.updateExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    console.error('updateExpert error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/experts/:id
 * Admin only — removes an expert profile.
 */
exports.deleteExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndDelete(req.params.id);
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });
    res.json({ msg: 'Expert deleted successfully' });
  } catch (err) {
    console.error('deleteExpert error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
