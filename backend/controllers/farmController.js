const Farm = require('../models/Farm');

exports.createFarm = async (req, res) => {
  try {
    const farm = new Farm({ ...req.body, userId: req.user.id });
    await farm.save();
    res.json(farm);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Returns ALL farms for the user (for listing)
exports.getAllFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.id });
    res.json(farms);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Returns the FIRST farm (for compatibility with old code)
exports.getFarmByUser = async (req, res) => {
  try {
    const farm = await Farm.findOne({ userId: req.user.id });
    res.json(farm);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(farm);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteFarm = async (req, res) => {
  try {
    await Farm.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ msg: 'Farm deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};