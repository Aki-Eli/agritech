/**
 * Soil Health controller.
 * Records and retrieves soil health readings linked to a specific crop.
 */
const SoilHealth = require('../models/SoilHealth');
const Crop = require('../models/Crop');

/**
 * POST /api/soil-health/:cropId
 * Records a new soil health reading and updates the crop's moisture field.
 */
exports.addSoilHealth = async (req, res) => {
  try {
    const soil = new SoilHealth({ ...req.body, cropId: req.params.cropId });
    await soil.save();

    // Keep the crop's cached moisture value in sync with the latest reading
    await Crop.findByIdAndUpdate(req.params.cropId, {
      soilMoisture: req.body.moisture,
      soilNutrients: req.body.nitrogen
    });

    res.status(201).json(soil);
  } catch (err) {
    console.error('addSoilHealth error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/soil-health/:cropId
 * Returns all soil health records for a crop, newest first.
 */
exports.getSoilHealthForCrop = async (req, res) => {
  try {
    const records = await SoilHealth.find({ cropId: req.params.cropId })
      .sort({ date: -1 })
      .lean();
    res.json(records);
  } catch (err) {
    console.error('getSoilHealthForCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
