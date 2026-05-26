/**
 * Farm controller.
 * All operations are scoped to the authenticated user — a farmer can only
 * access and modify their own farms.
 */
const Farm = require('../models/Farm');

/**
 * POST /api/farms
 * Creates a new farm for the authenticated user.
 */
exports.createFarm = async (req, res) => {
  try {
    const farm = new Farm({ ...req.body, userId: req.user.id });
    await farm.save();
    res.status(201).json(farm);
  } catch (err) {
    console.error('createFarm error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/farms
 * Returns all farms belonging to the authenticated user.
 */
exports.getAllFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.id }).lean();
    res.json(farms);
  } catch (err) {
    console.error('getAllFarms error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/farms/:id
 * Updates a specific farm. Ownership is enforced via userId in the query.
 */
exports.updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!farm) return res.status(404).json({ msg: 'Farm not found or not authorized' });
    res.json(farm);
  } catch (err) {
    console.error('updateFarm error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/farms/:id
 * Deletes a specific farm. Ownership is enforced via userId in the query.
 */
exports.deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!farm) return res.status(404).json({ msg: 'Farm not found or not authorized' });
    res.json({ msg: 'Farm deleted successfully' });
  } catch (err) {
    console.error('deleteFarm error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
