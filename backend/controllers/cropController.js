const Crop = require('../models/Crop');
const SoilHealth = require('../models/SoilHealth');
const FarmActivity = require('../models/FarmActivity');

exports.addCrop = async (req, res) => {
  try {
    const crop = new Crop(req.body);
    await crop.save();
    res.json(crop);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getCropsByFarm = async (req, res) => {
  try {
    const crops = await Crop.find({ farmId: req.params.farmId, harvested: false });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getHarvestedCropsByFarm = async (req, res) => {
  try {
    const crops = await Crop.find({ farmId: req.params.farmId, harvested: true }).sort({ harvestDate: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.harvestCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { harvested: true, harvestDate: new Date(), growthStage: 'Harvest' },
      { new: true }
    );
    if (!crop) {
      return res.status(404).json({ msg: 'Crop not found' });
    }
    // Try to log activity, but don't fail if it errors
    try {
      const FarmActivity = require('../models/FarmActivity');
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
      // Still return success for the crop harvest
    }
    return res.status(200).json({ msg: 'Crop harvested successfully', crop });
  } catch (err) {
    console.error('Harvest error:', err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.addSoilHealth = async (req, res) => {
  try {
    const soil = new SoilHealth({ ...req.body, cropId: req.params.cropId });
    await soil.save();
    await Crop.findByIdAndUpdate(req.params.cropId, { soilMoisture: req.body.moisture });
    res.json(soil);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getSoilHealthForCrop = async (req, res) => {
  try {
    const records = await SoilHealth.find({ cropId: req.params.cropId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });

    // Get latest soil health record for full nutrient data
    const latestSoil = await SoilHealth.findOne({ cropId: req.params.cropId }).sort({ date: -1 });

    const recs = [];

    // Moisture recommendations
    if (crop.soilMoisture !== undefined && crop.soilMoisture !== null) {
      if (crop.soilMoisture < 30) recs.push('⚠️ Low moisture – increase irrigation frequency.');
      else if (crop.soilMoisture > 70) recs.push('⚠️ High moisture – reduce watering, risk of root rot.');
      else recs.push('✅ Soil moisture is optimal.');
    }

    if (latestSoil) {
      // pH recommendations
      if (latestSoil.ph < 5.5) recs.push('⚠️ Soil is too acidic (pH ' + latestSoil.ph + ') – apply lime to raise pH.');
      else if (latestSoil.ph > 7.5) recs.push('⚠️ Soil is too alkaline (pH ' + latestSoil.ph + ') – apply sulfur to lower pH.');
      else recs.push('✅ Soil pH (' + latestSoil.ph + ') is in the optimal range (5.5–7.5).');

      // Nitrogen recommendations
      if (latestSoil.nitrogen < 20) recs.push('⚠️ Low nitrogen (' + latestSoil.nitrogen + ' ppm) – apply nitrogen-rich fertilizer or compost.');
      else if (latestSoil.nitrogen > 100) recs.push('⚠️ Excess nitrogen (' + latestSoil.nitrogen + ' ppm) – reduce nitrogen fertilizer to prevent leaf burn.');
      else recs.push('✅ Nitrogen levels are adequate.');

      // Phosphorus recommendations
      if (latestSoil.phosphorus < 10) recs.push('⚠️ Low phosphorus (' + latestSoil.phosphorus + ' ppm) – apply phosphate fertilizer to support root development.');
      else recs.push('✅ Phosphorus levels are adequate.');

      // Potassium recommendations
      if (latestSoil.potassium < 100) recs.push('⚠️ Low potassium (' + latestSoil.potassium + ' ppm) – apply potash fertilizer to improve disease resistance.');
      else recs.push('✅ Potassium levels are adequate.');
    } else {
      recs.push('ℹ️ No nutrient data recorded yet. Record a soil health reading for full recommendations.');
    }

    res.json({ recommendations: recs.join('\n') });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};