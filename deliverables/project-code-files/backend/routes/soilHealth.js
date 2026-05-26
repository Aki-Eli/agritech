const express = require('express');
const { addSoilHealth, getSoilHealthForCrop } = require('../controllers/soilHealthController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/crop/:cropId', auth, addSoilHealth);
router.get('/crop/:cropId', auth, getSoilHealthForCrop);

module.exports = router;