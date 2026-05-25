const express = require('express');
const {
  createFarm,
  getAllFarms,
  getFarmByUser,
  updateFarm,
  deleteFarm
} = require('../controllers/farmController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createFarm);
router.get('/', auth, getAllFarms);        // list all farms
router.get('/me', auth, getFarmByUser);    // get single farm (first one)
router.put('/:id', auth, updateFarm);
router.delete('/:id', auth, deleteFarm);

module.exports = router;