const express = require('express');
const { createFarm, getAllFarms, updateFarm, deleteFarm } = require('../controllers/farmController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/',     auth, createFarm);
router.get('/',      auth, getAllFarms);
router.put('/:id',   auth, updateFarm);
router.delete('/:id',auth, deleteFarm);

module.exports = router;
