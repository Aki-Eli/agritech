/**
 * Farm Activity controller.
 * Tracks farming operations (planting, fertilizing, irrigation, harvesting) per farm.
 */
const FarmActivity = require('../models/FarmActivity');

// Resource optimization tips keyed by activity type
const ACTIVITY_TIPS = {
  fertilizing: 'Consider soil testing to avoid over-fertilization.',
  irrigation:  'Use drip irrigation to save water.',
  planting:    'Plant at optimal spacing for better yield.',
  harvesting:  'Store harvested produce in a cool, dry place to extend shelf life.',
};

/**
 * GET /api/farm-activities/:farmId
 * Returns all activities for a given farm, newest first.
 */
exports.getFarmActivities = async (req, res) => {
  try {
    const activities = await FarmActivity.find({ farmId: req.params.farmId })
      .sort({ date: -1 })
      .lean();
    res.json(activities);
  } catch (err) {
    console.error('getFarmActivities error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/farm-activities
 * Logs a new farm activity and returns an optional resource optimization tip.
 */
exports.addFarmActivity = async (req, res) => {
  try {
    const activity = new FarmActivity(req.body);
    await activity.save();

    const tip = ACTIVITY_TIPS[activity.type] || '';
    res.status(201).json({ activity, tip });
  } catch (err) {
    console.error('addFarmActivity error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/farm-activities/:id
 * Deletes a specific farm activity record.
 */
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await FarmActivity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });
    res.json({ msg: 'Activity deleted successfully' });
  } catch (err) {
    console.error('deleteActivity error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
