const express = require('express');
const { createTicket, getMyTickets } = require('../controllers/supportController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createTicket);
router.get('/me', auth, getMyTickets);

module.exports = router;
