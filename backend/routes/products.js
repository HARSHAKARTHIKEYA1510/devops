const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addReview, deleteReview, getFeaturedProducts, getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, authorize('admin'), deleteReview);

module.exports = router;
