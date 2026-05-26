const express = require('express');
const { getAlerts, createAlert, markAsRead, markImplement, reportPest } = require('../controllers/alertController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAlerts);
router.post('/', auth, createAlert);
router.put('/:id/read', auth, markAsRead);
router.put('/:id/implement', auth, markImplement);
router.post('/report', auth, reportPest);

module.exports = router;