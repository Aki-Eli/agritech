const express = require('express');
const { addCrop, getCropsByFarm, getHarvestedCropsByFarm, updateCrop, deleteCrop, addSoilHealth, getRecommendations, getSoilHealthForCrop, harvestCrop } = require('../controllers/cropController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, addCrop);
router.get('/farm/:farmId', auth, getCropsByFarm);
router.get('/farm/:farmId/harvested', auth, getHarvestedCropsByFarm);
router.put('/:id', auth, updateCrop);
router.delete('/:id', auth, deleteCrop);
router.post('/:cropId/soil-health', auth, addSoilHealth);
router.get('/:cropId/soil-health', auth, getSoilHealthForCrop);
router.get('/:cropId/recommendations', auth, getRecommendations);
router.put('/:id/harvest', auth, harvestCrop);

module.exports = router;