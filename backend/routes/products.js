const express = require('express');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', auth, getProducts);
router.post('/', [auth, admin], createProduct);
router.put('/:id', [auth, admin], updateProduct);
router.delete('/:id', [auth, admin], deleteProduct);

module.exports = router;