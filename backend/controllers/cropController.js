/**
 * Crop controller.
 * Manages crop records tied to a specific farm.
 */
const Crop = require('../models/Crop');
const SoilHealth = require('../models/SoilHealth');
const FarmActivity = require('../models/FarmActivity');

/**
 * POST /api/crops
 * Adds a new crop record.
 */
exports.addCrop = async (req, res) => {
  try {
    const crop = new Crop(req.body);
    await crop.save();
    res.status(201).json(crop);
  } catch (err) {
    console.error('addCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/crops/farm/:farmId
 * Returns all active (non-harvested) crops for a given farm.
 */
exports.getCropsByFarm = async (req, res) => {
  try {
    const crops = await Crop.find({ farmId: req.params.farmId, harvested: false }).lean();
    res.json(crops);
  } catch (err) {
    console.error('getCropsByFarm error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/crops/farm/:farmId/harvested
 * Returns all harvested crops for a given farm, newest first.
 */
exports.getHarvestedCropsByFarm = async (req, res) => {
  try {
    const crops = await Crop.find({ farmId: req.params.farmId, harvested: true })
      .sort({ harvestDate: -1 })
      .lean();
    res.json(crops);
  } catch (err) {
    console.error('getHarvestedCropsByFarm error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/crops/:id
 * Updates a crop record.
 */
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    console.error('updateCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/crops/:id
 * Deletes a crop record.
 */
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    res.json({ msg: 'Crop deleted successfully' });
  } catch (err) {
    console.error('deleteCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/crops/:id/harvest
 * Marks a crop as harvested and auto-logs a harvesting activity.
 */
exports.harvestCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { harvested: true, harvestDate: new Date(), growthStage: 'Harvest' },
      { new: true }
    );
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });

    // Auto-log a harvesting activity — non-critical, so errors are swallowed
    try {
      await FarmActivity.create({
        farmId: crop.farmId,
        type: 'harvesting',
        cropType: crop.type,
        date: new Date(),
        quantity: 'Harvested',
        notes: 'Auto-generated from harvest action'
      });
    } catch (activityErr) {
      console.error('Failed to log harvest activity:', activityErr.message);
    }

    res.json({ msg: 'Crop harvested successfully', crop });
  } catch (err) {
    console.error('harvestCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/crops/:cropId/soil-health
 * Records a soil health reading for a crop and updates the crop's moisture field.
 */
exports.addSoilHealth = async (req, res) => {
  try {
    const soil = new SoilHealth({ ...req.body, cropId: req.params.cropId });
    await soil.save();
    await Crop.findByIdAndUpdate(req.params.cropId, { soilMoisture: req.body.moisture });
    res.status(201).json(soil);
  } catch (err) {
    console.error('addSoilHealth error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/crops/:cropId/soil-health
 * Returns all soil health records for a crop, newest first.
 */
exports.getSoilHealthForCrop = async (req, res) => {
  try {
    const records = await SoilHealth.find({ cropId: req.params.cropId }).sort({ date: -1 }).lean();
    res.json(records);
  } catch (err) {
    console.error('getSoilHealthForCrop error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/crops/:cropId/recommendations
 * Returns agronomic recommendations based on the latest soil health data.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId).lean();
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });

    const latestSoil = await SoilHealth.findOne({ cropId: req.params.cropId }).sort({ date: -1 }).lean();
    const recs = [];

    // Moisture recommendations
    if (crop.soilMoisture !== undefined && crop.soilMoisture !== null) {
      if (crop.soilMoisture < 30) {
        recs.push('⚠️ Low moisture – increase irrigation frequency.');
      } else if (crop.soilMoisture > 70) {
        recs.push('⚠️ High moisture – reduce watering, risk of root rot.');
      } else {
        recs.push('✅ Soil moisture is optimal.');
      }
    }

    if (latestSoil) {
      if (latestSoil.ph < 5.5) {
        recs.push(`⚠️ Soil is too acidic (pH ${latestSoil.ph}) – apply lime to raise pH.`);
      } else if (latestSoil.ph > 7.5) {
        recs.push(`⚠️ Soil is too alkaline (pH ${latestSoil.ph}) – apply sulfur to lower pH.`);
      } else {
        recs.push(`✅ Soil pH (${latestSoil.ph}) is in the optimal range (5.5–7.5).`);
      }

      if (latestSoil.nitrogen < 20) {
        recs.push(`⚠️ Low nitrogen (${latestSoil.nitrogen} ppm) – apply nitrogen-rich fertilizer or compost.`);
      } else if (latestSoil.nitrogen > 100) {
        recs.push(`⚠️ Excess nitrogen (${latestSoil.nitrogen} ppm) – reduce nitrogen fertilizer to prevent leaf burn.`);
      } else {
        recs.push('✅ Nitrogen levels are adequate.');
      }

      if (latestSoil.phosphorus < 10) {
        recs.push(`⚠️ Low phosphorus (${latestSoil.phosphorus} ppm) – apply phosphate fertilizer to support root development.`);
      } else {
        recs.push('✅ Phosphorus levels are adequate.');
      }

      if (latestSoil.potassium < 100) {
        recs.push(`⚠️ Low potassium (${latestSoil.potassium} ppm) – apply potash fertilizer to improve disease resistance.`);
      } else {
        recs.push('✅ Potassium levels are adequate.');
      }
    } else {
      recs.push('ℹ️ No nutrient data recorded yet. Record a soil health reading for full recommendations.');
    }

    res.json({ recommendations: recs.join('\n') });
  } catch (err) {
    console.error('getRecommendations error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
