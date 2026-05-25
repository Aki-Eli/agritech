const FarmActivity = require('../models/FarmActivity');

exports.getFarmActivities = async (req, res) => {
  try {
    const activities = await FarmActivity.find({ farmId: req.params.farmId }).sort({ date: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addFarmActivity = async (req, res) => {
  try {
    const activity = new FarmActivity(req.body);
    await activity.save();

    // Optional: generate resource optimization tip based on activity type
    let tip = '';
    if (activity.type === 'fertilizing') tip = 'Consider soil testing to avoid over-fertilization.';
    else if (activity.type === 'irrigation') tip = 'Use drip irrigation to save water.';
    else if (activity.type === 'planting') tip = 'Plant at optimal spacing for better yield.';
    
    res.json({ activity, tip });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    await FarmActivity.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};