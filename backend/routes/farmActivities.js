const express = require('express');
const { getFarmActivities, addFarmActivity, deleteActivity } = require('../controllers/farmActivityController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:farmId', auth, getFarmActivities);
router.post('/', auth, addFarmActivity);
router.delete('/:id', auth, deleteActivity);

module.exports = router;