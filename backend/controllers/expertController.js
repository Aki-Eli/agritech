const Expert = require('../models/Expert');

// Public (authenticated): list all available experts
exports.getExperts = async (req, res) => {
  try {
    const experts = await Expert.find().sort({ name: 1 });
    res.json(experts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin: create expert profile
exports.createExpert = async (req, res) => {
  try {
    const expert = new Expert(req.body);
    await expert.save();
    res.status(201).json(expert);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin: update expert profile
exports.updateExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin: delete expert profile
exports.deleteExpert = async (req, res) => {
  try {
    await Expert.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Expert deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
