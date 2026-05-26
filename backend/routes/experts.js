const express = require('express');
const { getExperts, createExpert, updateExpert, deleteExpert } = require('../controllers/expertController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', auth, getExperts);
router.post('/', auth, admin, createExpert);
router.put('/:id', auth, admin, updateExpert);
router.delete('/:id', auth, admin, deleteExpert);

module.exports = router;
