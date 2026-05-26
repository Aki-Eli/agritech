const express = require('express');
const { getAllUsers, updateProfile, deleteOwnAccount, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// Admin only — list all users
router.get('/', [auth, admin], getAllUsers);

// Self-service — any authenticated user updates/deletes their own account
router.put('/profile/:id', auth, updateProfile);
router.delete('/profile/:id', auth, deleteOwnAccount);

// Admin only — manage any user
router.put('/:id', [auth, admin], updateUser);
router.delete('/:id', [auth, admin], deleteUser);

module.exports = router;
