const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  addAddress, deleteAddress, toggleWishlist, getWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
