const SoilHealth = require('../models/SoilHealth');
const Crop = require('../models/Crop');

exports.addSoilHealth = async (req, res) => {
  try {
    const soil = new SoilHealth({ ...req.body, cropId: req.params.cropId });
    await soil.save();
    // update crop with latest soil data
    await Crop.findByIdAndUpdate(req.params.cropId, {
      soilMoisture: req.body.moisture,
      soilNutrients: req.body.nitrogen 
    });
    res.json(soil);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSoilHealthForCrop = async (req, res) => {
  try {
    const records = await SoilHealth.find({ cropId: req.params.cropId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};