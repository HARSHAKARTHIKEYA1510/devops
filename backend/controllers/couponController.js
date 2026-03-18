const Coupon = require('../models/Coupon');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order of ₹${coupon.minOrderAmount} required` });
    }
    if (coupon.usersUsed.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }
    let discount =
      coupon.discountType === 'percentage'
        ? Math.round((cartTotal * coupon.discountValue) / 100)
        : coupon.discountValue;
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    res.status(200).json({ success: true, coupon, discount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) { next(error); }
};

// @desc    Create coupon (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) { next(error); }
};

// @desc    Update coupon (Admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) { next(error); }
};

// @desc    Delete coupon (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) { next(error); }
};
