const express = require('express');
const { getWeather, getForecast } = require('../controllers/weatherController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getWeather);
router.get('/forecast', auth, getForecast);

module.exports = router;